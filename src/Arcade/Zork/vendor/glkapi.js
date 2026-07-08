'use strict';

/* GlkAPI -- a Javascript Glk API for IF interfaces
 * GlkOte Library: version 2.3.7.
 * Glk API which this implements: version 0.7.6.
 * Designed by Andrew Plotkin <erkyrath@eblong.com>
 * <http://eblong.com/zarf/glk/glkote.html>
 * 
 * This Javascript library is copyright 2010-2025 by Andrew Plotkin.
 * It is distributed under the MIT license; see the "LICENSE" file.
 *
 * This file is a Glk API compatibility layer for glkote.js. It offers a 
 * set of Javascript calls which closely match the original C Glk API;
 * these work by means of glkote.js operations.
 *
 * This API was built for Quixe, which is a pure-Javascript Glulx
 * interpreter. Therefore, the API is a little strange. Notably, it
 * accepts text buffers in the form of arrays of integers, not
 * Javascript strings. Only the Glk calls that explicitly use strings
 * (glk_put_string, etc) accept Javascript native strings.
 *
 * If you are writing an application in pure Javascript, you can use
 * this layer (along with glkote.js). If you are writing a web app which
 * is the front face of a server-side Glk app, ignore this file -- use
 * glkote.js directly.
 */

/* Known problems:

   Some places in the library get confused about Unicode characters
   beyond 0xFFFF. They are handled correctly by streams, but grid windows
   will think they occupy two characters rather than one, which will
   throw off the grid spacing. 

   Also, the glk_put_jstring() function can't handle them at all. Quixe
   printing operations that funnel through glk_put_jstring() -- meaning, 
   most native string printing -- will break up three-byte characters 
   into a UTF-16-encoded pair of two-byte characters. This will come
   out okay in a buffer window, but it will again mess up grid windows,
   and will also double the write-count in a stream.
*/

/* All state is contained in GlkClass. */
var GlkClass = function() {

var GlkOte = null; /* imported API object */
var VM = null; /* imported API object (the VM interface) */
var GiDispa = null; /* imported API object (the dispatch layer) */
var Blorb = null; /* imported API object (the resource layer) */

/* Environment capabilities. (Checked at init time.) */
var has_canvas;

/* Options from the vm_options object. */
var option_exit_warning;
var option_do_vm_autosave;
var option_before_select_hook;
var option_extevent_hook;
var option_glk_gestalt_hook;

/* Library display state. */
var has_exited = false;
var ui_disabled = false;
var ui_specialinput = null;
var ui_specialcallback = null;
var event_generation = 0;
var current_partial_inputs = null;
var current_partial_outputs = null;

/* Initialize the library, initialize the VM, and set it running. (It will 
   run until the first glk_select() or glk_exit() call.)

   The vm_options argument must have a vm_options.vm field, which must be an
   appropriate VM interface object. (For example, Quixe.) This must have
   init() and resume() methods.

   The vm_options argument is also passed through to GlkOte as the game
   interface object. It can be used to affect some GlkOte display options,
   such as window spacing.

   (You do not need to provide a vm_options.accept() function. The Glk
   library sets that up for you.)
*/
function init(vm_options) {
    /* Either GlkOte was passed in or we must create one. */
    if (vm_options.GlkOte) {
        GlkOte = vm_options.GlkOte;
    }
    else if (window.GlkOteClass) {
        GlkOte = new window.GlkOteClass();
    }

    /* Either Blorb was passed in or we don't have one. */
    if (vm_options.Blorb) {
        Blorb = vm_options.Blorb;
    }

    /* Check for canvas support. We don't rely on jquery here. */
    has_canvas = (document.createElement('canvas').getContext != undefined);

    VM = vm_options.vm;
    GiDispa = vm_options.GiDispa; /* may be null/undefined */
    
    vm_options.accept = accept_ui_event;

    option_exit_warning = vm_options.exit_warning;
    option_do_vm_autosave = vm_options.do_vm_autosave;
    option_before_select_hook = vm_options.before_select_hook;
    option_extevent_hook = vm_options.extevent_hook;
    option_glk_gestalt_hook = vm_options.glk_gestalt_hook;

    if (option_before_select_hook) {
        option_before_select_hook();
    }

    /* Initialize the lower levels. */
    
    if (GiDispa)
        GiDispa.init({ io:vm_options.io, vm:vm_options.vm });
    GlkOte.init(vm_options);
}

function is_inited() {
    return (VM != null && GlkOte != null);
}

function accept_ui_event(obj) {
    var box;

    //qlog("### accept_ui_event: " + obj.type + ", gen " + obj.gen);
    if (ui_disabled) {
        /* We've hit glk_exit() or a VM fatal error, or just blocked the UI for
           some modal dialog. */
        qlog("### ui is disabled, ignoring event");
        return;
    }

    if (obj.gen != event_generation) {
      GlkOte.log('Input event had wrong generation number: got ' + obj.gen + ', currently at ' + event_generation);
      return;
    }
    event_generation += 1;

    /* Note any partial inputs; we'll need them if the game cancels a line
       input. This may be undef. */
    current_partial_inputs = obj.partial;

    switch (obj.type) {
    case 'init':
        content_metrics = complete_metrics(obj.metrics);
        /* We ignore the support array. This library is updated in sync
           with GlkOte, so we know what it supports. */
        VM.start();
        break;

    case 'external':
        var res = null;
        if (option_extevent_hook) {
            res = option_extevent_hook(obj.value);
        }
        if (!res && obj.value == 'timer') {
            /* Timer events no longer come in this way, but we'll still
               accept them. */
            gli_timer_started = Date.now();
            res = { type: Const.evtype_Timer };
        }
        if (res && res.type) {
            handle_external_input(res);
        }
        break;

    case 'timer':
        gli_timer_started = Date.now();
        var res = { type: Const.evtype_Timer };
        handle_external_input(res);
        break;

    case 'hyperlink':
        handle_hyperlink_input(obj.window, obj.value);
        break;

    case 'mouse':
        handle_mouse_input(obj.window, obj.x, obj.y);
        break;

    case 'char':
        handle_char_input(obj.window, obj.value);
        break;

    case 'line':
        handle_line_input(obj.window, obj.value, obj.terminator);
        break;

    case 'arrange':
        content_metrics = complete_metrics(obj.metrics);
        box = {
            left: content_metrics.outspacingx,
            top: content_metrics.outspacingy,
            right: content_metrics.width-content_metrics.outspacingx,
            bottom: content_metrics.height-content_metrics.outspacingy
        };
        if (gli_rootwin)
            gli_window_rearrange(gli_rootwin, box);
        handle_arrange_input();
        break;

    case 'redraw':
        handle_redraw_input();
        break;

    case 'specialresponse':
        if (obj.response == 'fileref_prompt') {
            gli_fileref_create_by_prompt_callback(obj);
        }
        break;
    }
}

/* Given a partial metrics object, return one with all the required
   values. Missing values will default to 0 or the standard inherited
   terms. (E.g., if "inspacingx" is missing it will default to
   "inspacing", then "spacing", then 0. See measure_window() in 
   glkote.js or data_metrics_parse() in RemGlk.)

   All values in the given object will be copied over; defaulting only
   applies to missing values from the required set.
*/
function complete_metrics(metrics) {

    // Default values if absolutely nothing is specified.
    var res = {
        width: 80,
        height: 50,
        
        gridcharwidth: 1,
        gridcharheight: 1,
        buffercharwidth: 1,
        buffercharheight: 1,
        
        gridmarginx: 0,
        gridmarginy: 0,
        buffermarginx: 0,
        buffermarginy: 0,
        graphicsmarginx: 0,
        graphicsmarginy: 0,
        
        outspacingx: 0,
        outspacingy: 0,
        inspacingx: 0,
        inspacingy: 0,
    };

    // Various ways of specifying defaults.
    var val;

    val = metrics.charwidth;
    if (val !== undefined) {
        res.gridcharwidth = val;
        res.buffercharwidth = val;
    }
    val = metrics.charheight;
    if (val !== undefined) {
        res.gridcharheight = val;
        res.buffercharheight = val;
    }

    val = metrics.margin;
    if (val !== undefined) {
        res.gridmarginx = val;
        res.gridmarginy = val;
        res.buffermarginx = val;
        res.buffermarginy = val;
        res.graphicsmarginx = val;
        res.graphicsmarginy = val;
    }    

    val = metrics.gridmargin;
    if (val !== undefined) {
        res.gridmarginx = val;
        res.gridmarginy = val;
    }
    
    val = metrics.buffermargin;
    if (val !== undefined) {
        res.buffermarginx = val;
        res.buffermarginy = val;
    }
    
    val = metrics.graphicsmargin;
    if (val !== undefined) {
        res.graphicsmarginx = val;
        res.graphicsmarginy = val;
    }

    val = metrics.marginx;
    if (val !== undefined) {
        res.gridmarginx = val;
        res.buffermarginx = val;
        res.graphicsmarginx = val;
    }
    
    val = metrics.marginy;
    if (val !== undefined) {
        res.gridmarginy = val;
        res.buffermarginy = val;
        res.graphicsmarginy = val;
    }

    val = metrics.spacing;
    if (val !== undefined) {
        res.inspacingx = val;
        res.inspacingy = val;
        res.outspacingx = val;
        res.outspacingy = val;
    }

    val = metrics.inspacing;
    if (val !== undefined) {
        res.inspacingx = val;
        res.inspacingy = val;
    }

    val = metrics.outspacing;
    if (val !== undefined) {
        res.outspacingx = val;
        res.outspacingy = val;
    }

    val = metrics.spacingx;
    if (val !== undefined) {
        res.inspacingx = val;
        res.outspacingx = val;
    }

    val = metrics.spacingy;
    if (val !== undefined) {
        res.inspacingy = val;
        res.outspacingy = val;
    }
    
    // Copy over all the supplied fields. These override the defaults above.
    res = Object.assign(res, metrics);
    
    return res;
}
    
function handle_arrange_input() {
    if (!gli_selectref)
        return;

    gli_selectref.set_field(0, Const.evtype_Arrange);
    gli_selectref.set_field(1, null);
    gli_selectref.set_field(2, 0);
    gli_selectref.set_field(3, 0);

    if (GiDispa)
        GiDispa.prepare_resume(gli_selectref);
    gli_selectref = null;
    VM.resume();
}

function handle_redraw_input() {
    if (!gli_selectref)
        return;

    gli_selectref.set_field(0, Const.evtype_Redraw);
    gli_selectref.set_field(1, null);
    gli_selectref.set_field(2, 0);
    gli_selectref.set_field(3, 0);

    if (GiDispa)
        GiDispa.prepare_resume(gli_selectref);
    gli_selectref = null;
    VM.resume();
}

function handle_external_input(res) {
    if (!gli_selectref)
        return;

    /* This also handles timer input. */
    var val1 = 0;
    var val2 = 0;
    if (res.val1)
        val1 = res.val1;
    if (res.val2)
        val2 = res.val2;

    gli_selectref.set_field(0, res.type);
    gli_selectref.set_field(1, null);
    gli_selectref.set_field(2, val1);
    gli_selectref.set_field(3, val2);

    if (GiDispa)
        GiDispa.prepare_resume(gli_selectref);
    gli_selectref = null;
    VM.resume();
}

function handle_hyperlink_input(disprock, val) {
    if (!gli_selectref)
        return;

    var win = null;
    for (win=gli_windowlist; win; win=win.next) {
        if (win.disprock == disprock) 
            break;
    }
    if (!win || !win.hyperlink_request)
        return;

    gli_selectref.set_field(0, Const.evtype_Hyperlink);
    gli_selectref.set_field(1, win);
    gli_selectref.set_field(2, val);
    gli_selectref.set_field(3, 0);

    win.hyperlink_request = false;

    if (GiDispa)
        GiDispa.prepare_resume(gli_selectref);
    gli_selectref = null;
    VM.resume();
}

function handle_mouse_input(disprock, xpos, ypos) {
    if (!gli_selectref)
        return;

    var win = null;
    for (win=gli_windowlist; win; win=win.next) {
        if (win.disprock == disprock) 
            break;
    }
    if (!win || !win.mouse_request)
        return;

    gli_selectref.set_field(0, Const.evtype_MouseInput);
    gli_selectref.set_field(1, win);
    gli_selectref.set_field(2, xpos);
    gli_selectref.set_field(3, ypos);

    win.mouse_request = false;

    if (GiDispa)
        GiDispa.prepare_resume(gli_selectref);
    gli_selectref = null;
    VM.resume();
}

function handle_char_input(disprock, input) {
    var charval;

    if (!gli_selectref)
        return;

    var win = null;
    for (win=gli_windowlist; win; win=win.next) {
        if (win.disprock == disprock) 
            break;
    }
    if (!win || !win.char_request)
        return;

    if (input.length == 1) {
        charval = input.charCodeAt(0);
        if (charval >= 0x100 && !win.char_request_uni)
            charval = Const.keycode_Unknown;
    }
    else {
        charval = KeystrokeNameMap[input];
        if (!charval)
            charval = Const.keycode_Unknown;
    }

    gli_selectref.set_field(0, Const.evtype_CharInput);
    gli_selectref.set_field(1, win);
    gli_selectref.set_field(2, charval);
    gli_selectref.set_field(3, 0);

    win.char_request = false;
    win.char_request_uni = false;
    win.input_generation = null;

    if (GiDispa)
        GiDispa.prepare_resume(gli_selectref);
    gli_selectref = null;
    VM.resume();
}

function handle_line_input(disprock, input, termkey) {
    var ix;

    if (!gli_selectref)
        return;

    var win = null;
    for (win=gli_windowlist; win; win=win.next) {
        if (win.disprock == disprock) 
            break;
    }
    if (!win || !win.line_request)
        return;

    if (input.length > win.linebuf.length)
        input = input.slice(0, win.linebuf.length);

    if (win.request_echo_line_input) {
        ix = win.style;
        gli_set_style(win.str, Const.style_Input);
        gli_window_put_string(win, input);
        if (win.echostr)
            glk_put_jstring_stream(win.echostr, input);
        gli_set_style(win.str, ix);
        gli_window_put_string(win, "\n");
        if (win.echostr)
            glk_put_jstring_stream(win.echostr, "\n");
    }

    for (ix=0; ix<input.length; ix++)
        win.linebuf[ix] = input.charCodeAt(ix);

    var termcode = 0;
    if (termkey && KeystrokeNameMap[termkey]) 
        termcode = KeystrokeNameMap[termkey];

    gli_selectref.set_field(0, Const.evtype_LineInput);
    gli_selectref.set_field(1, win);
    gli_selectref.set_field(2, input.length);
    gli_selectref.set_field(3, termcode);

    if (GiDispa)
        GiDispa.unretain_array(win.linebuf);
    win.line_request = false;
    win.line_request_uni = false;
    win.request_echo_line_input = null;
    win.input_generation = null;
    win.linebuf = null;

    if (GiDispa)
        GiDispa.prepare_resume(gli_selectref);
    gli_selectref = null;
    VM.resume();
}

function update() {
    var dataobj = { type: 'update', gen: event_generation };
    var winarray = null;
    var contentarray = null;
    var inputarray = null;
    var win, obj, robj, useobj, lineobj, ls, val, ix, cx;
    var initial, lastpos, laststyle, lasthyperlink;

    if (geometry_changed) {
        geometry_changed = false;
        winarray = [];
        for (win=gli_windowlist; win; win=win.next) {
            if (win.type == Const.wintype_Pair)
                continue;

            obj = { id: win.disprock, rock: win.rock };
            winarray.push(obj);

            switch (win.type) {
            case Const.wintype_TextBuffer:
                obj.type = 'buffer';
                break;
            case Const.wintype_TextGrid:
                obj.type = 'grid';
                obj.gridwidth = win.gridwidth;
                obj.gridheight = win.gridheight;
                break;
            case Const.wintype_Graphics:
                obj.type = 'graphics';
                obj.graphwidth = win.graphwidth;
                obj.graphheight = win.graphheight;
                break;
            }

            obj.left = win.bbox.left;
            obj.top = win.bbox.top;
            obj.width = win.bbox.right - win.bbox.left;
            obj.height = win.bbox.bottom - win.bbox.top;
        }
    }

    for (win=gli_windowlist; win; win=win.next) {
        useobj = false;
        obj = { id: win.disprock };
        if (contentarray == null)
            contentarray = [];

        switch (win.type) {
        case Const.wintype_TextBuffer:
            gli_window_buffer_deaccumulate(win);
            if (win.content.length) {
                obj.text = win.content.slice(0);
                win.content.length = 0;
                useobj = true;
            }
            if (win.clearcontent) {
                obj.clear = true;
                win.clearcontent = false;
                useobj = true;
                if (!obj.text) {
                    obj.text = [];
                }
                win.reserve.length = 0;
            }
            if (obj.text && obj.text.length) {
                for (ix=0; ix<obj.text.length; ix++) {
                    win.reserve.push(obj.text[ix]);
                }
            }
            if (win.reserve.length > 100) {
                win.reserve.splice(0, win.reserve.length-100);
            }
            break;
        case Const.wintype_TextGrid:
            if (win.gridwidth == 0 || win.gridheight == 0)
                break;
            obj.lines = [];
            for (ix=0; ix<win.gridheight; ix++) {
                lineobj = win.lines[ix];
                if (!lineobj.dirty)
                    continue;
                lineobj.dirty = false;
                ls = [];
                lastpos = 0;
                for (cx=0; cx<win.gridwidth; ) {
                    laststyle = lineobj.styles[cx];
                    lasthyperlink = lineobj.hyperlinks[cx];
                    for (; cx<win.gridwidth 
                             && lineobj.styles[cx] == laststyle
                             && lineobj.hyperlinks[cx] == lasthyperlink; 
                         cx++) { }
                    if (lastpos < cx) {
                        if (!lasthyperlink) {
                            ls.push(StyleNameMap[laststyle]);
                            ls.push(lineobj.chars.slice(lastpos, cx).join(''));
                        }
                        else {
                            robj = { style:StyleNameMap[laststyle], text:lineobj.chars.slice(lastpos, cx).join(''), hyperlink:lasthyperlink };
                            ls.push(robj);
                        }
                        lastpos = cx;
                    }
                }
                obj.lines.push({ line:ix, content:ls });
            }
            useobj = obj.lines.length;
            break;
        case Const.wintype_Graphics:
            if (win.content.length) {
                obj.draw = win.content.slice(0);
                win.content.length = 0;
                useobj = true;
            }
            /* Copy new drawing commands over to the reserve. Keep track
               of the last (whole-window) fill command. */
            var clearedat = -1;
            if (obj.draw && obj.draw.length) {
                for (ix=0; ix<obj.draw.length; ix++) {
                    var drawel = obj.draw[ix];
                    if (drawel.special == 'fill' 
                        && drawel.x === undefined && drawel.y === undefined 
                        && drawel.width === undefined && drawel.height === undefined) {
                        clearedat = win.reserve.length;
                    }
                    win.reserve.push(drawel);
                }
            }
            if (clearedat >= 0) {
                /* We're going to delete every command before the
                   fill, except that we save the last setcolor. */
                var setcol = null;
                for (ix=0; ix<win.reserve.length && ix<clearedat; ix++) {
                    var drawel = win.reserve[ix];
                    if (drawel.special == 'setcolor')
                        setcol = drawel;
                }
                win.reserve.splice(0, clearedat);
                if (setcol)
                    win.reserve.unshift(setcol);
            }
            break;
        }

        if (useobj)
            contentarray.push(obj);
    }

    inputarray = [];
    for (win=gli_windowlist; win; win=win.next) {
        obj = null;
        if (win.char_request) {
            obj = { id: win.disprock, type: 'char', gen: win.input_generation };
            if (win.type == Const.wintype_TextGrid) {
                if (gli_window_grid_canonicalize(win)) {
                    obj.xpos = win.gridwidth;
                    obj.ypos = win.gridheight-1;
                }
                else {
                    obj.xpos = win.cursorx;
                    obj.ypos = win.cursory;
                }
            }
        }
        if (win.line_request) {
            initial = '';
            if (current_partial_outputs) {
                val = current_partial_outputs[win.disprock];
                if (val)
                    initial = val;
            }
            /* Note that the initial and terminators fields will be ignored
               if this is a continued (old) input request. So it doesn't
               matter if they're wrong. */
            obj = { id: win.disprock, type: 'line', gen: win.input_generation,
                    maxlen: win.linebuf.length, initial: initial };
            if (win.line_input_terminators.length) {
                obj.terminators = win.line_input_terminators;
            }
            if (win.type == Const.wintype_TextGrid) {
                if (gli_window_grid_canonicalize(win)) {
                    obj.xpos = win.gridwidth;
                    obj.ypos = win.gridheight-1;
                }
                else {
                    obj.xpos = win.cursorx;
                    obj.ypos = win.cursory;
                }
            }
        }
        if (win.hyperlink_request) {
            if (!obj)
                obj = { id: win.disprock };
            obj.hyperlink = true;
        }
        if (win.mouse_request) {
            if (!obj)
                obj = { id: win.disprock };
            obj.mouse = true;
        }
        if (obj)
            inputarray.push(obj);
    }

    dataobj.windows = winarray;
    dataobj.content = contentarray;
    dataobj.input = inputarray;

    if (gli_timer_lastsent != gli_timer_interval) {
        //qlog("### timer update: " + gli_timer_interval);
        dataobj.timer = gli_timer_interval;
        gli_timer_lastsent = gli_timer_interval;
    }

    if (ui_specialinput) {
        //qlog("### special input: " + ui_specialinput.type);
        dataobj.specialinput = ui_specialinput;
    }

    if (ui_disabled) {
        //qlog("### disabling ui");
        dataobj.disable = true;
    }
    if (has_exited) {
        dataobj.exit = true;
    }

    /* Clean this up; it's only meaningful within one run/update cycle. */
    current_partial_outputs = null;

    /* If we're doing an autorestore, gli_autorestore_glkstate will 
       contain additional setup information for the first update()
       call only. */
    if (gli_autorestore_glkstate)
        dataobj.autorestore = gli_autorestore_glkstate;
    gli_autorestore_glkstate = null;

    GlkOte.update(dataobj, gli_autorestore_glkstate);

    if (option_before_select_hook) {
        option_before_select_hook();
    }
    if (option_do_vm_autosave) {
        if (has_exited) {
            /* On quit or fatal error, delete the autosave. */
            VM.do_autosave(-1);
        }
        else {
            /* If this is a good time, autosave. */
            var eventarg = GiDispa.check_autosave();
            if (eventarg)
                VM.do_autosave(eventarg);
        }
    }
}

/* Return the library interface object that we were passed or created.
   Call this if you want to use, e.g., the same Dialog object that GlkOte
   is using.
*/
function get_library(val) {
    switch (val) {
        case 'VM': return VM;
        case 'GlkOte': return GlkOte;
        case 'GiDispa': return GiDispa;
        case 'Blorb': return Blorb;
        case 'Dialog': return GlkOte.getlibrary('Dialog');
    }
    /* Unrecognized library name. */
    return null;
}
    
/* Wrap up the current display state as a (JSONable) object. This is
   called from Quixe.vm_autosave.
*/
function save_allstate() {
    var Dialog = GlkOte.getlibrary('Dialog');
    var res = {};

    if (gli_rootwin)
        res.rootwin = gli_rootwin.disprock;

    if (gli_currentstr)
        res.currentstr = gli_currentstr.disprock;

    if (gli_timer_interval)
        res.timer_interval = gli_timer_interval;

    res.windows = [];
    for (var win = gli_windowlist; win; win = win.next) {
        var obj = {
            type: win.type, rock: win.rock, disprock: win.disprock,
            style: win.style, hyperlink: win.hyperlink
        };
        if (win.parent)
            obj.parent = win.parent.disprock;
        obj.str = win.str.disprock;
        if (win.echostr)
            obj.echostr = win.echostr.disprock;

        obj.bbox = { 
            left: win.bbox.left, right: win.bbox.right,
            top: win.bbox.top, bottom: win.bbox.bottom 
        };

        if (win.linebuf !== null) {
            var info = GiDispa.get_retained_array(win.linebuf);
            obj.linebuf = {
                addr: info.addr,
                len: info.len,
                arr: info.arr.slice(0),
                arg: info.arg.serialize()
            };
        }
        obj.char_request = win.char_request;
        obj.line_request = win.line_request;
        obj.char_request_uni = win.char_request_uni;
        obj.line_request_uni = win.line_request_uni;
        obj.hyperlink_request = win.hyperlink_request;
        obj.mouse_request = win.mouse_request;
        obj.echo_line_input = win.echo_line_input;
        obj.request_echo_line_input = win.request_echo_line_input;
        obj.line_input_terminators = win.line_input_terminators.slice(0);
        //### should have a request_line_input_terminators as well

        switch (win.type) {
        case Const.wintype_TextBuffer:
            obj.reserve = win.reserve.slice(0);
            break;
        case Const.wintype_TextGrid:
            obj.gridwidth = win.gridwidth;
            obj.gridheight = win.gridheight;
            obj.lines = [];
            for (var ix=0; ix<win.lines.length; ix++) {
                var ln = win.lines[ix];
                obj.lines.push({
                        chars: ln.chars.slice(0),
                        styles: ln.styles.slice(0),
                        hyperlinks: ln.hyperlinks.slice(0)
                    });
            }
            obj.cursorx = win.cursorx;
            obj.cursory = win.cursory;
            break;
        case Const.wintype_Graphics:
            obj.graphwidth = win.graphwidth;
            obj.graphheight = win.graphheight;
            obj.reserve = win.reserve.slice(0);
            break;
        case Const.wintype_Pair:
            obj.pair_dir = win.pair_dir;
            obj.pair_division = win.pair_division;
            obj.pair_key = win.pair_key.disprock;
            obj.pair_keydamage = false;
            obj.pair_size = win.pair_size;
            obj.pair_hasborder = win.pair_hasborder;
            obj.pair_vertical = win.pair_vertical;
            obj.pair_backward = win.pair_backward;
            obj.child1 = win.child1.disprock;
            obj.child2 = win.child2.disprock;
            break;
        }

        res.windows.push(obj);
    }

    res.streams = [];
    for (var str = gli_streamlist; str; str = str.next) {
        var obj = {
            type: str.type, rock: str.rock, disprock: str.disprock,
            unicode: str.unicode, isbinary: str.isbinary,
            readcount: str.readcount, writecount: str.writecount,
            readable: str.readable, writable: str.writable,
            streaming: str.streaming
        };

        switch (str.type) {

        case strtype_Window:
            if (str.win)
                obj.win = str.win.disprock;
            break;

        case strtype_Memory:
            if (str.buf !== null) {
                var info = GiDispa.get_retained_array(str.buf);
                obj.buf = {
                    addr: info.addr,
                    len: info.len,
                    arr: info.arr.slice(0),
                    arg: info.arg.serialize()
                };
            }
            obj.buflen = str.buflen;
            obj.bufpos = str.bufpos;
            obj.bufeof = str.bufeof;
            break;

        case strtype_Resource:
            obj.resfilenum = str.resfilenum;
            // Don't need str.buf
            obj.buflen = str.buflen;
            obj.bufpos = str.bufpos;
            obj.bufeof = str.bufeof;
            break;

        case strtype_File:
            obj.origfmode = str.origfmode;
            if (!Dialog.streaming) {
                obj.ref = str.ref;
                gli_stream_flush_file(str);
                // Don't need str.buf
                obj.buflen = str.buflen;
                obj.bufpos = str.bufpos;
                obj.bufeof = str.bufeof;
            }
            else {
                str.fstream.fflush();
                obj.ref = str.ref;
                obj.filepos = str.fstream.ftell();
            }
            break;

        }

        res.streams.push(obj);
    }

    res.filerefs = [];
    for (var fref = gli_filereflist; fref; fref = fref.next) {
        var obj = {
            type: fref.type, rock: fref.rock, disprock: fref.disprock,
            filename: fref.filename, textmode: fref.textmode,
            filetype: fref.filetype, filetypename: fref.filetypename
        };

        obj.ref = fref.ref;

        res.filerefs.push(obj);
    }

    // Ignore gli_schannellist, as it's currently always empty.

    /* Save GlkOte-level information. This includes the overall metrics. */
    res.glkote = GlkOte.save_allstate();

    return res;
}

/* Take display information (created by save_allstate) and set up our
   state to match it. Called from vm_autorestore.
*/
function restore_allstate(res)
{
    var Dialog = GlkOte.getlibrary('Dialog');
    
    if (gli_windowlist || gli_streamlist || gli_filereflist)
        throw('restore_allstate: glkapi module has already been launched');

    /* We build and register all the bare objects first. (In reverse
       order so that the linked lists come out right way around.) */

    for (var ix=res.windows.length-1; ix>=0; ix--) {
        var obj = res.windows[ix];
        var win = {
            type: obj.type, rock: obj.rock, disprock: obj.disprock,
            style: obj.style, hyperlink: obj.hyperlink
        };
        GiDispa.class_register('window', win, win.disprock);

        win.prev = null;
        win.next = gli_windowlist;
        gli_windowlist = win;
        if (win.next)
            win.next.prev = win;
    }

    for (var ix=res.streams.length-1; ix>=0; ix--) {
        var obj = res.streams[ix];
        var str = {
            type: obj.type, rock: obj.rock, disprock: obj.disprock,
            unicode: obj.unicode, isbinary: obj.isbinary,
            readcount: obj.readcount, writecount: obj.writecount,
            readable: obj.readable, writable: obj.writable,
            streaming: obj.streaming
        };
        GiDispa.class_register('stream', str, str.disprock);

        str.prev = null;
        str.next = gli_streamlist;
        gli_streamlist = str;
        if (str.next)
            str.next.prev = str;
    }

    for (var ix=res.filerefs.length-1; ix>=0; ix--) {
        var obj = res.filerefs[ix];
        var fref = {
            type: obj.type, rock: obj.rock, disprock: obj.disprock,
            filename: obj.filename, textmode: obj.textmode,
            filetype: obj.filetype, filetypename: obj.filetypename
        };
        GiDispa.class_register('fileref', fref, fref.disprock);

        fref.prev = null;
        fref.next = gli_filereflist;
        gli_filereflist = fref;
        if (fref.next)
            fref.next.prev = fref;
    }

    /* ...Now we fill in the cross-references. */

    for (var ix=0; ix<res.windows.length; ix++) {
        var obj = res.windows[ix];
        var win = GiDispa.class_obj_from_id('window', obj.disprock);

        win.parent = GiDispa.class_obj_from_id('window', obj.parent);
        win.str = GiDispa.class_obj_from_id('stream', obj.str);
        win.echostr = GiDispa.class_obj_from_id('stream', obj.echostr);

        win.bbox = { 
            left: obj.bbox.left, right: obj.bbox.right,
            top: obj.bbox.top, bottom: obj.bbox.bottom 
        };

        win.input_generation = null;
        if (obj.char_request || obj.line_request)
            win.input_generation = event_generation;
        win.linebuf = null;
        if (obj.linebuf !== undefined) {
            // should clone that object
            win.linebuf = obj.linebuf.arr;
            GiDispa.retain_array(win.linebuf, obj.linebuf);
        }
        win.char_request = obj.char_request;
        win.line_request = obj.line_request;
        win.char_request_uni = obj.char_request_uni;
        win.line_request_uni = obj.line_request_uni;
        win.hyperlink_request = obj.hyperlink_request;
        win.mouse_request = obj.mouse_request;
        win.echo_line_input = obj.echo_line_input;
        win.request_echo_line_input = obj.request_echo_line_input;
        win.line_input_terminators = obj.line_input_terminators.slice(0);
        //### should have a request_line_input_terminators as well

        switch (win.type) {
        case Const.wintype_TextBuffer:
            win.accum = [];
            win.accumstyle = win.style;
            win.accumhyperlink = win.hyperlink;
            win.content = obj.reserve.slice(0);
            win.clearcontent = false;
            win.reserve = [];
            break;
        case Const.wintype_TextGrid:
            win.gridwidth = obj.gridwidth;
            win.gridheight = obj.gridheight;
            win.lines = [];
            for (var jx=0; jx<obj.lines.length; jx++) {
                var ln = obj.lines[jx];
                win.lines.push({
                        dirty: true,
                        chars: ln.chars.slice(0),
                        styles: ln.styles.slice(0),
                        hyperlinks: ln.hyperlinks.slice(0)
                    });
            }
            win.cursorx = obj.cursorx;
            win.cursory = obj.cursory;
            break;
        case Const.wintype_Graphics:
            win.graphwidth = obj.graphwidth;
            win.graphheight = obj.graphheight;
            win.content = obj.reserve.slice(0);
            win.reserve = [];
            break;
        case Const.wintype_Pair:
            win.pair_dir = obj.pair_dir;
            win.pair_division = obj.pair_division;
            win.pair_key = GiDispa.class_obj_from_id('window', obj.pair_key);
            win.pair_keydamage = false;
            win.pair_size = obj.pair_size;
            win.pair_hasborder = obj.pair_hasborder;
            win.pair_vertical = obj.pair_vertical;
            win.pair_backward = obj.pair_backward;
            win.child1 = GiDispa.class_obj_from_id('window', obj.child1);
            win.child2 = GiDispa.class_obj_from_id('window', obj.child2);
            break;
        }
    }

    for (var ix=0; ix<res.streams.length; ix++) {
        var obj = res.streams[ix];
        var str = GiDispa.class_obj_from_id('stream', obj.disprock);

        /* Defaults first... */
        str.win = null;
        str.ref = null;
        str.file = null;

        str.buf = null;
        str.bufpos = 0;
        str.buflen = 0;
        str.bufeof = 0;
        str.timer_id = null;
        str.flush_func = null;
        str.fstream = null;

        switch (str.type) {

        case strtype_Window:
            str.win = GiDispa.class_obj_from_id('window', obj.win);
            break;

        case strtype_Memory:
            if (obj.buf !== undefined) {
                // should clone that object
                str.buf = obj.buf.arr;
                GiDispa.retain_array(str.buf, obj.buf);
            }
            str.buflen = obj.buflen;
            str.bufpos = obj.bufpos;
            str.bufeof = obj.bufeof;
            break;

        case strtype_Resource:
            str.resfilenum = obj.resfilenum;
            var el = Blorb.get_data_chunk(str.resfilenum);
            if (el) {
                str.buf = el.data;
            }
            str.buflen = obj.buflen;
            str.bufpos = obj.bufpos;
            str.bufeof = obj.bufeof;
            break;

        case strtype_File:
            str.origfmode = obj.origfmode;
            if (!Dialog.streaming) {
                str.ref = obj.ref;
                str.buflen = obj.buflen;
                str.bufpos = obj.bufpos;
                str.bufeof = obj.bufeof;

                var content = Dialog.file_read(str.ref);
                if (content == null) {
                    /* The file was somehow deleted. Create an empty
                       file (even in read mode). */
                    content = [];
                    Dialog.file_write(str.ref, '', true);
                }
                str.buf = content;

                /* If the file has been shortened, we might have to
                   trim bufeof to fit within it. The game might see
                   the file pos mysteriously move; sorry. */
                str.bufeof = content.length;
                if (str.bufpos > str.bufeof)
                    str.bufpos = str.bufeof;
            }
            else {
                str.ref = obj.ref;
                str.fstream = Dialog.file_fopen(str.origfmode, str.ref);
                if (!str.fstream) {
                    /* This is the panic case. We can't reopen the stream,
                       but the game expects an open stream! We'll just
                       have to open a temporary file; the user will never
                       get their data, but at least the game won't crash.
                       (Better policy would be to prompt the user for
                       a new file location...) */
                    var tempref = Dialog.file_construct_temp_ref(str.ref.usage);
                    str.fstream = Dialog.file_fopen(str.origfmode, tempref);
                    if (!str.fstream)
                        throw('restore_allstate: could not reopen even a temp stream for: ' + str.ref.filename);
                }

                if (str.origfmode != Const.filemode_WriteAppend) {
                    /* Jump to the last known filepos. */
                    str.fstream.fseek(obj.filepos, Const.seekmode_Start);
                }

                str.buffer4 = str.fstream.BufferClass.alloc(4);
            }
            break;

        }
    }

    for (var ix=0; ix<res.filerefs.length; ix++) {
        var obj = res.filerefs[ix];
        var fref = GiDispa.class_obj_from_id('fileref', obj.disprock);

        fref.ref = obj.ref; // should deep clone
    }

    gli_rootwin = GiDispa.class_obj_from_id('window', res.rootwin);
    gli_currentstr = GiDispa.class_obj_from_id('stream', res.currentstr);

    if (res.timer_interval)
        glk_request_timer_events(res.timer_interval);

    /* Stash this for the next (first) GlkOte.update call. */
    gli_autorestore_glkstate = res.glkote;
}

/* This is the handler for a VM fatal error. (Not for an error in our own
   library!) We display the error message, and then push a final display
   update, which kills all input fields in all windows.
*/
function fatal_error(msg) {
    has_exited = true;
    ui_disabled = true;
    if (!GlkOte) {
        // We haven't been initialized yet, so we can only try to log the error and hope someone sees it.
        console.log('Fatal error:', msg);
        return;
    }
    GlkOte.error(msg);
    var dataobj = { type: 'update', gen: event_generation, disable: true };
    dataobj.input = [];
    GlkOte.update(dataobj);
}

/* All the numeric constants used by the Glk interface. We push these into
   an object, for tidiness. */

var Const = {
    gestalt_Version : 0,
    gestalt_CharInput : 1,
    gestalt_LineInput : 2,
    gestalt_CharOutput : 3,
      gestalt_CharOutput_CannotPrint : 0,
      gestalt_CharOutput_ApproxPrint : 1,
      gestalt_CharOutput_ExactPrint : 2,
    gestalt_MouseInput : 4,
    gestalt_Timer : 5,
    gestalt_Graphics : 6,
    gestalt_DrawImage : 7,
    gestalt_Sound : 8,
    gestalt_SoundVolume : 9,
    gestalt_SoundNotify : 10,
    gestalt_Hyperlinks : 11,
    gestalt_HyperlinkInput : 12,
    gestalt_SoundMusic : 13,
    gestalt_GraphicsTransparency : 14,
    gestalt_Unicode : 15,
    gestalt_UnicodeNorm : 16,
    gestalt_LineInputEcho : 17,
    gestalt_LineTerminators : 18,
    gestalt_LineTerminatorKey : 19,
    gestalt_DateTime : 20,
    gestalt_Sound2 : 21,
    gestalt_ResourceStream : 22,
    gestalt_GraphicsCharInput : 23,
    gestalt_DrawImageScale : 24,

    keycode_Unknown  : 0xffffffff,
    keycode_Left     : 0xfffffffe,
    keycode_Right    : 0xfffffffd,
    keycode_Up       : 0xfffffffc,
    keycode_Down     : 0xfffffffb,
    keycode_Return   : 0xfffffffa,
    keycode_Delete   : 0xfffffff9,
    keycode_Escape   : 0xfffffff8,
    keycode_Tab      : 0xfffffff7,
    keycode_PageUp   : 0xfffffff6,
    keycode_PageDown : 0xfffffff5,
    keycode_Home     : 0xfffffff4,
    keycode_End      : 0xfffffff3,
    keycode_Func1    : 0xffffffef,
    keycode_Func2    : 0xffffffee,
    keycode_Func3    : 0xffffffed,
    keycode_Func4    : 0xffffffec,
    keycode_Func5    : 0xffffffeb,
    keycode_Func6    : 0xffffffea,
    keycode_Func7    : 0xffffffe9,
    keycode_Func8    : 0xffffffe8,
    keycode_Func9    : 0xffffffe7,
    keycode_Func10   : 0xffffffe6,
    keycode_Func11   : 0xffffffe5,
    keycode_Func12   : 0xffffffe4,
    /* The last keycode is always (0x100000000 - keycode_MAXVAL) */
    keycode_MAXVAL   : 28,

    evtype_None : 0,
    evtype_Timer : 1,
    evtype_CharInput : 2,
    evtype_LineInput : 3,
    evtype_MouseInput : 4,
    evtype_Arrange : 5,
    evtype_Redraw : 6,
    evtype_SoundNotify : 7,
    evtype_Hyperlink : 8,
    evtype_VolumeNotify : 9,

    style_Normal : 0,
    style_Emphasized : 1,
    style_Preformatted : 2,
    style_Header : 3,
    style_Subheader : 4,
    style_Alert : 5,
    style_Note : 6,
    style_BlockQuote : 7,
    style_Input : 8,
    style_User1 : 9,
    style_User2 : 10,
    style_NUMSTYLES : 11,

    wintype_AllTypes : 0,
    wintype_Pair : 1,
    wintype_Blank : 2,
    wintype_TextBuffer : 3,
    wintype_TextGrid : 4,
    wintype_Graphics : 5,

    winmethod_Left  : 0x00,
    winmethod_Right : 0x01,
    winmethod_Above : 0x02,
    winmethod_Below : 0x03,
    winmethod_DirMask : 0x0f,

    winmethod_Fixed : 0x10,
    winmethod_Proportional : 0x20,
    winmethod_DivisionMask : 0xf0,

    winmethod_Border : 0x000,
    winmethod_NoBorder : 0x100,
    winmethod_BorderMask : 0x100,

    fileusage_Data : 0x00,
    fileusage_SavedGame : 0x01,
    fileusage_Transcript : 0x02,
    fileusage_InputRecord : 0x03,
    fileusage_TypeMask : 0x0f,

    fileusage_TextMode   : 0x100,
    fileusage_BinaryMode : 0x000,

    filemode_Write : 0x01,
    filemode_Read : 0x02,
    filemode_ReadWrite : 0x03,
    filemode_WriteAppend : 0x05,

    seekmode_Start : 0,
    seekmode_Current : 1,
    seekmode_End : 2,

    stylehint_Indentation : 0,
    stylehint_ParaIndentation : 1,
    stylehint_Justification : 2,
    stylehint_Size : 3,
    stylehint_Weight : 4,
    stylehint_Oblique : 5,
    stylehint_Proportional : 6,
    stylehint_TextColor : 7,
    stylehint_BackColor : 8,
    stylehint_ReverseColor : 9,
    stylehint_NUMHINTS : 10,

      stylehint_just_LeftFlush : 0,
      stylehint_just_LeftRight : 1,
      stylehint_just_Centered : 2,
      stylehint_just_RightFlush : 3,

    imagealign_InlineUp : 1,
    imagealign_InlineDown : 2,
    imagealign_InlineCenter : 3,
    imagealign_MarginLeft : 4,
    imagealign_MarginRight : 5,
    
    imagerule_WidthOrig : 0x01,
    imagerule_WidthFixed : 0x02,
    imagerule_WidthRatio : 0x03,
    imagerule_WidthMask : 0x03,
    imagerule_HeightOrig : 0x04,
    imagerule_HeightFixed : 0x08,
    imagerule_AspectRatio : 0x0C,
    imagerule_HeightMask : 0x0C,
    imagerule_WidthWindowMax : 0x10
};

var KeystrokeNameMap = {
    /* The key values are taken from GlkOte's "char" event. A couple of them
       are Javascript keywords, so they're in quotes, but that doesn't affect
       the final structure. */
    left : Const.keycode_Left,
    right : Const.keycode_Right,
    up : Const.keycode_Up,
    down : Const.keycode_Down,
    'return' : Const.keycode_Return,
    'delete' : Const.keycode_Delete,
    escape : Const.keycode_Escape,
    tab : Const.keycode_Tab,
    pageup : Const.keycode_PageUp,
    pagedown : Const.keycode_PageDown,
    home : Const.keycode_Home,
    end : Const.keycode_End,
    func1 : Const.keycode_Func1,
    func2 : Const.keycode_Func2,
    func3 : Const.keycode_Func3,
    func4 : Const.keycode_Func4,
    func5 : Const.keycode_Func5,
    func6 : Const.keycode_Func6,
    func7 : Const.keycode_Func7,
    func8 : Const.keycode_Func8,
    func9 : Const.keycode_Func9,
    func10 : Const.keycode_Func10,
    func11 : Const.keycode_Func11,
    func12 : Const.keycode_Func12
};

/* The inverse of KeystrokeNameMap. We'll fill this in if needed. (It 
   generally isn't.) */
var KeystrokeValueMap = null;

var StyleNameMap = {
    0 : 'normal',
    1 : 'emphasized',
    2 : 'preformatted',
    3 : 'header',
    4 : 'subheader',
    5 : 'alert',
    6 : 'note',
    7 : 'blockquote',
    8 : 'input',
    9 : 'user1',
    10 : 'user2'
};

var FileTypeMap = {
    0: 'data',
    1: 'save',
    2: 'transcript',
    3: 'command'
};

/* These tables were generated by casemap.py. */
/* Derived from Unicode data files, Unicode version 4.0.1. */

/* list all the special cases in unicode_upper_table */
var unicode_upper_table = {
181: 924, 223: [ 83,83 ], 255: 376, 305: 73, 329: [ 700,78 ],
383: 83, 405: 502, 414: 544, 447: 503, 454: 452,
457: 455, 460: 458, 477: 398, 496: [ 74,780 ], 499: 497,
595: 385, 596: 390, 598: 393, 599: 394, 601: 399,
603: 400, 608: 403, 611: 404, 616: 407, 617: 406,
623: 412, 626: 413, 629: 415, 640: 422, 643: 425,
648: 430, 650: 433, 651: 434, 658: 439, 837: 921,
912: [ 921,776,769 ], 940: 902, 941: 904, 942: 905, 943: 906,
944: [ 933,776,769 ], 962: 931, 972: 908, 973: 910, 974: 911,
976: 914, 977: 920, 981: 934, 982: 928, 1008: 922,
1010: 1017, 1013: 917, 1415: [ 1333,1362 ], 7830: [ 72,817 ], 7831: [ 84,776 ],
7832: [ 87,778 ], 7833: [ 89,778 ], 7834: [ 65,702 ], 7835: 7776, 8016: [ 933,787 ],
8018: [ 933,787,768 ], 8020: [ 933,787,769 ], 8022: [ 933,787,834 ], 8048: 8122, 8049: 8123,
8050: 8136, 8051: 8137, 8052: 8138, 8053: 8139, 8054: 8154,
8055: 8155, 8056: 8184, 8057: 8185, 8058: 8170, 8059: 8171,
8060: 8186, 8061: 8187, 8064: [ 7944,921 ], 8065: [ 7945,921 ], 8066: [ 7946,921 ],
8067: [ 7947,921 ], 8068: [ 7948,921 ], 8069: [ 7949,921 ], 8070: [ 7950,921 ], 8071: [ 7951,921 ],
8072: [ 7944,921 ], 8073: [ 7945,921 ], 8074: [ 7946,921 ], 8075: [ 7947,921 ], 8076: [ 7948,921 ],
8077: [ 7949,921 ], 8078: [ 7950,921 ], 8079: [ 7951,921 ], 8080: [ 7976,921 ], 8081: [ 7977,921 ],
8082: [ 7978,921 ], 8083: [ 7979,921 ], 8084: [ 7980,921 ], 8085: [ 7981,921 ], 8086: [ 7982,921 ],
8087: [ 7983,921 ], 8088: [ 7976,921 ], 8089: [ 7977,921 ], 8090: [ 7978,921 ], 8091: [ 7979,921 ],
8092: [ 7980,921 ], 8093: [ 7981,921 ], 8094: [ 7982,921 ], 8095: [ 7983,921 ], 8096: [ 8040,921 ],
8097: [ 8041,921 ], 8098: [ 8042,921 ], 8099: [ 8043,921 ], 8100: [ 8044,921 ], 8101: [ 8045,921 ],
8102: [ 8046,921 ], 8103: [ 8047,921 ], 8104: [ 8040,921 ], 8105: [ 8041,921 ], 8106: [ 8042,921 ],
8107: [ 8043,921 ], 8108: [ 8044,921 ], 8109: [ 8045,921 ], 8110: [ 8046,921 ], 8111: [ 8047,921 ],
8114: [ 8122,921 ], 8115: [ 913,921 ], 8116: [ 902,921 ], 8118: [ 913,834 ], 8119: [ 913,834,921 ],
8124: [ 913,921 ], 8126: 921, 8130: [ 8138,921 ], 8131: [ 919,921 ], 8132: [ 905,921 ],
8134: [ 919,834 ], 8135: [ 919,834,921 ], 8140: [ 919,921 ], 8146: [ 921,776,768 ], 8147: [ 921,776,769 ],
8150: [ 921,834 ], 8151: [ 921,776,834 ], 8162: [ 933,776,768 ], 8163: [ 933,776,769 ], 8164: [ 929,787 ],
8165: 8172, 8166: [ 933,834 ], 8167: [ 933,776,834 ], 8178: [ 8186,921 ], 8179: [ 937,921 ],
8180: [ 911,921 ], 8182: [ 937,834 ], 8183: [ 937,834,921 ], 8188: [ 937,921 ], 64256: [ 70,70 ],
64257: [ 70,73 ], 64258: [ 70,76 ], 64259: [ 70,70,73 ], 64260: [ 70,70,76 ], 64261: [ 83,84 ],
64262: [ 83,84 ], 64275: [ 1348,1350 ], 64276: [ 1348,1333 ], 64277: [ 1348,1339 ], 64278: [ 1358,1350 ],
64279: [ 1348,1341 ]
};
/* add all the regular cases to unicode_upper_table */
(function() {
  var ls, ix, val;
  var map = unicode_upper_table;
  ls = [
7936, 7937, 7938, 7939, 7940, 7941, 7942, 7943,
7952, 7953, 7954, 7955, 7956, 7957, 7968, 7969,
7970, 7971, 7972, 7973, 7974, 7975, 7984, 7985,
7986, 7987, 7988, 7989, 7990, 7991, 8000, 8001,
8002, 8003, 8004, 8005, 8017, 8019, 8021, 8023,
8032, 8033, 8034, 8035, 8036, 8037, 8038, 8039,
8112, 8113, 8144, 8145, 8160, 8161,
  ];
  for (ix=0; ix<54; ix++) {
    val = ls[ix];
    map[val] = val+8;
  }
  for (val=257; val<=303; val+=2) {
    map[val] = val-1;
  }
  for (val=331; val<=375; val+=2) {
    map[val] = val-1;
  }
  for (val=505; val<=543; val+=2) {
    map[val] = val-1;
  }
  for (val=1121; val<=1153; val+=2) {
    map[val] = val-1;
  }
  for (val=1163; val<=1215; val+=2) {
    map[val] = val-1;
  }
  for (val=1233; val<=1269; val+=2) {
    map[val] = val-1;
  }
  for (val=7681; val<=7829; val+=2) {
    map[val] = val-1;
  }
  for (val=7841; val<=7929; val+=2) {
    map[val] = val-1;
  }
  ls = [
307, 309, 311, 314, 316, 318, 320, 322,
324, 326, 328, 378, 380, 382, 387, 389,
392, 396, 402, 409, 417, 419, 421, 424,
429, 432, 436, 438, 441, 445, 453, 456,
459, 462, 464, 466, 468, 470, 472, 474,
476, 479, 481, 483, 485, 487, 489, 491,
493, 495, 498, 501, 547, 549, 551, 553,
555, 557, 559, 561, 563, 985, 987, 989,
991, 993, 995, 997, 999, 1001, 1003, 1005,
1007, 1016, 1019, 1218, 1220, 1222, 1224, 1226,
1228, 1230, 1273, 1281, 1283, 1285, 1287, 1289,
1291, 1293, 1295,
  ];
  for (ix=0; ix<91; ix++) {
    val = ls[ix];
    map[val] = val-1;
  }
  for (val=8560; val<=8575; val+=1) {
    map[val] = val-16;
  }
  for (val=9424; val<=9449; val+=1) {
    map[val] = val-26;
  }
  for (val=97; val<=122; val+=1) {
    map[val] = val-32;
  }
  for (val=224; val<=246; val+=1) {
    map[val] = val-32;
  }
  for (val=945; val<=961; val+=1) {
    map[val] = val-32;
  }
  for (val=1072; val<=1103; val+=1) {
    map[val] = val-32;
  }
  for (val=65345; val<=65370; val+=1) {
    map[val] = val-32;
  }
  ls = [
248, 249, 250, 251, 252, 253, 254, 963,
964, 965, 966, 967, 968, 969, 970, 971,
  ];
  for (ix=0; ix<16; ix++) {
    val = ls[ix];
    map[val] = val-32;
  }
  for (val=66600; val<=66639; val+=1) {
    map[val] = val-40;
  }
  for (val=1377; val<=1414; val+=1) {
    map[val] = val-48;
  }
  for (val=1104; val<=1119; val+=1) {
    map[val] = val-80;
  }
  map[1009] = 929;
})();

/* list all the special cases in unicode_lower_table */
var unicode_lower_table = {
304: [ 105,775 ], 376: 255, 385: 595, 390: 596, 393: 598,
394: 599, 398: 477, 399: 601, 400: 603, 403: 608,
404: 611, 406: 617, 407: 616, 412: 623, 413: 626,
415: 629, 422: 640, 425: 643, 430: 648, 433: 650,
434: 651, 439: 658, 452: 454, 455: 457, 458: 460,
497: 499, 502: 405, 503: 447, 544: 414, 902: 940,
904: 941, 905: 942, 906: 943, 908: 972, 910: 973,
911: 974, 1012: 952, 1017: 1010, 8122: 8048, 8123: 8049,
8124: 8115, 8136: 8050, 8137: 8051, 8138: 8052, 8139: 8053,
8140: 8131, 8154: 8054, 8155: 8055, 8170: 8058, 8171: 8059,
8172: 8165, 8184: 8056, 8185: 8057, 8186: 8060, 8187: 8061,
8188: 8179, 8486: 969, 8490: 107, 8491: 229
};
/* add all the regular cases to unicode_lower_table */
(function() {
  var ls, ix, val;
  var map = unicode_lower_table;
  for (val=1024; val<=1039; val+=1) {
    map[val] = val+80;
  }
  for (val=1329; val<=1366; val+=1) {
    map[val] = val+48;
  }
  for (val=66560; val<=66599; val+=1) {
    map[val] = val+40;
  }
  for (val=65; val<=90; val+=1) {
    map[val] = val+32;
  }
  for (val=192; val<=214; val+=1) {
    map[val] = val+32;
  }
  for (val=913; val<=929; val+=1) {
    map[val] = val+32;
  }
  for (val=1040; val<=1071; val+=1) {
    map[val] = val+32;
  }
  for (val=65313; val<=65338; val+=1) {
    map[val] = val+32;
  }
  ls = [
216, 217, 218, 219, 220, 221, 222, 931,
932, 933, 934, 935, 936, 937, 938, 939,
  ];
  for (ix=0; ix<16; ix++) {
    val = ls[ix];
    map[val] = val+32;
  }
  for (val=9398; val<=9423; val+=1) {
    map[val] = val+26;
  }
  for (val=8544; val<=8559; val+=1) {
    map[val] = val+16;
  }
  for (val=256; val<=302; val+=2) {
    map[val] = val+1;
  }
  for (val=330; val<=374; val+=2) {
    map[val] = val+1;
  }
  for (val=504; val<=542; val+=2) {
    map[val] = val+1;
  }
  for (val=1120; val<=1152; val+=2) {
    map[val] = val+1;
  }
  for (val=1162; val<=1214; val+=2) {
    map[val] = val+1;
  }
  for (val=1232; val<=1268; val+=2) {
    map[val] = val+1;
  }
  for (val=7680; val<=7828; val+=2) {
    map[val] = val+1;
  }
  for (val=7840; val<=7928; val+=2) {
    map[val] = val+1;
  }
  ls = [
306, 308, 310, 313, 315, 317, 319, 321,
323, 325, 327, 377, 379, 381, 386, 388,
391, 395, 401, 408, 416, 418, 420, 423,
428, 431, 435, 437, 440, 444, 453, 456,
459, 461, 463, 465, 467, 469, 471, 473,
475, 478, 480, 482, 484, 486, 488, 490,
492, 494, 498, 500, 546, 548, 550, 552,
554, 556, 558, 560, 562, 984, 986, 988,
990, 992, 994, 996, 998, 1000, 1002, 1004,
1006, 1015, 1018, 1217, 1219, 1221, 1223, 1225,
1227, 1229, 1272, 1280, 1282, 1284, 1286, 1288,
1290, 1292, 1294,
  ];
  for (ix=0; ix<91; ix++) {
    val = ls[ix];
    map[val] = val+1;
  }
  ls = [
7944, 7945, 7946, 7947, 7948, 7949, 7950, 7951,
7960, 7961, 7962, 7963, 7964, 7965, 7976, 7977,
7978, 7979, 7980, 7981, 7982, 7983, 7992, 7993,
7994, 7995, 7996, 7997, 7998, 7999, 8008, 8009,
8010, 8011, 8012, 8013, 8025, 8027, 8029, 8031,
8040, 8041, 8042, 8043, 8044, 8045, 8046, 8047,
8072, 8073, 8074, 8075, 8076, 8077, 8078, 8079,
8088, 8089, 8090, 8091, 8092, 8093, 8094, 8095,
8104, 8105, 8106, 8107, 8108, 8109, 8110, 8111,
8120, 8121, 8152, 8153, 8168, 8169,
  ];
  for (ix=0; ix<78; ix++) {
    val = ls[ix];
    map[val] = val-8;
  }
})();

/* list all the special cases in unicode_title_table */
var unicode_title_table = {
223: [ 83,115 ], 452: 453, 453: 453, 454: 453, 455: 456,
456: 456, 457: 456, 458: 459, 459: 459, 460: 459,
497: 498, 498: 498, 499: 498, 1415: [ 1333,1410 ], 8114: [ 8122,837 ],
8115: 8124, 8116: [ 902,837 ], 8119: [ 913,834,837 ], 8124: 8124, 8130: [ 8138,837 ],
8131: 8140, 8132: [ 905,837 ], 8135: [ 919,834,837 ], 8140: 8140, 8178: [ 8186,837 ],
8179: 8188, 8180: [ 911,837 ], 8183: [ 937,834,837 ], 8188: 8188, 64256: [ 70,102 ],
64257: [ 70,105 ], 64258: [ 70,108 ], 64259: [ 70,102,105 ], 64260: [ 70,102,108 ], 64261: [ 83,116 ],
64262: [ 83,116 ], 64275: [ 1348,1398 ], 64276: [ 1348,1381 ], 64277: [ 1348,1387 ], 64278: [ 1358,1398 ],
64279: [ 1348,1389 ]
};
/* add all the regular cases to unicode_title_table */
(function() {
  var ls, ix, val;
  var map = unicode_title_table;
  ls = [
8072, 8073, 8074, 8075, 8076, 8077, 8078, 8079,
8072, 8073, 8074, 8075, 8076, 8077, 8078, 8079,
8088, 8089, 8090, 8091, 8092, 8093, 8094, 8095,
8088, 8089, 8090, 8091, 8092, 8093, 8094, 8095,
8104, 8105, 8106, 8107, 8108, 8109, 8110, 8111,
8104, 8105, 8106, 8107, 8108, 8109, 8110, 8111,
  ];
  for (ix=0; ix<48; ix++) {
    val = ls[ix];
    map[ix+8064] = val;
  }
})();

/* list all the special cases in unicode_decomp_table */
var unicode_decomp_table = {
192: [ 65,768 ], 193: [ 65,769 ], 194: [ 65,770 ], 195: [ 65,771 ], 196: [ 65,776 ],
197: [ 65,778 ], 199: [ 67,807 ], 200: [ 69,768 ], 201: [ 69,769 ], 202: [ 69,770 ],
203: [ 69,776 ], 204: [ 73,768 ], 205: [ 73,769 ], 206: [ 73,770 ], 207: [ 73,776 ],
209: [ 78,771 ], 210: [ 79,768 ], 211: [ 79,769 ], 212: [ 79,770 ], 213: [ 79,771 ],
214: [ 79,776 ], 217: [ 85,768 ], 218: [ 85,769 ], 219: [ 85,770 ], 220: [ 85,776 ],
221: [ 89,769 ], 224: [ 97,768 ], 225: [ 97,769 ], 226: [ 97,770 ], 227: [ 97,771 ],
228: [ 97,776 ], 229: [ 97,778 ], 231: [ 99,807 ], 232: [ 101,768 ], 233: [ 101,769 ],
234: [ 101,770 ], 235: [ 101,776 ], 236: [ 105,768 ], 237: [ 105,769 ], 238: [ 105,770 ],
239: [ 105,776 ], 241: [ 110,771 ], 242: [ 111,768 ], 243: [ 111,769 ], 244: [ 111,770 ],
245: [ 111,771 ], 246: [ 111,776 ], 249: [ 117,768 ], 250: [ 117,769 ], 251: [ 117,770 ],
252: [ 117,776 ], 253: [ 121,769 ], 296: [ 73,771 ], 297: [ 105,771 ], 298: [ 73,772 ],
299: [ 105,772 ], 300: [ 73,774 ], 301: [ 105,774 ], 302: [ 73,808 ], 303: [ 105,808 ],
304: [ 73,775 ], 308: [ 74,770 ], 309: [ 106,770 ], 310: [ 75,807 ], 311: [ 107,807 ],
313: [ 76,769 ], 314: [ 108,769 ], 315: [ 76,807 ], 316: [ 108,807 ], 317: [ 76,780 ],
318: [ 108,780 ], 323: [ 78,769 ], 324: [ 110,769 ], 325: [ 78,807 ], 326: [ 110,807 ],
327: [ 78,780 ], 328: [ 110,780 ], 332: [ 79,772 ], 333: [ 111,772 ], 334: [ 79,774 ],
335: [ 111,774 ], 336: [ 79,779 ], 337: [ 111,779 ], 416: [ 79,795 ], 417: [ 111,795 ],
431: [ 85,795 ], 432: [ 117,795 ], 478: [ 65,776,772 ], 479: [ 97,776,772 ], 480: [ 65,775,772 ],
481: [ 97,775,772 ], 482: [ 198,772 ], 483: [ 230,772 ], 486: [ 71,780 ], 487: [ 103,780 ],
488: [ 75,780 ], 489: [ 107,780 ], 490: [ 79,808 ], 491: [ 111,808 ], 492: [ 79,808,772 ],
493: [ 111,808,772 ], 494: [ 439,780 ], 495: [ 658,780 ], 496: [ 106,780 ], 500: [ 71,769 ],
501: [ 103,769 ], 542: [ 72,780 ], 543: [ 104,780 ], 550: [ 65,775 ], 551: [ 97,775 ],
552: [ 69,807 ], 553: [ 101,807 ], 554: [ 79,776,772 ], 555: [ 111,776,772 ], 556: [ 79,771,772 ],
557: [ 111,771,772 ], 558: [ 79,775 ], 559: [ 111,775 ], 560: [ 79,775,772 ], 561: [ 111,775,772 ],
562: [ 89,772 ], 563: [ 121,772 ], 832: 768, 833: 769, 835: 787,
836: [ 776,769 ], 884: 697, 894: 59, 901: [ 168,769 ], 902: [ 913,769 ],
903: 183, 904: [ 917,769 ], 905: [ 919,769 ], 906: [ 921,769 ], 908: [ 927,769 ],
910: [ 933,769 ], 911: [ 937,769 ], 912: [ 953,776,769 ], 938: [ 921,776 ], 939: [ 933,776 ],
940: [ 945,769 ], 941: [ 949,769 ], 942: [ 951,769 ], 943: [ 953,769 ], 944: [ 965,776,769 ],
970: [ 953,776 ], 971: [ 965,776 ], 972: [ 959,769 ], 973: [ 965,769 ], 974: [ 969,769 ],
979: [ 978,769 ], 980: [ 978,776 ], 1024: [ 1045,768 ], 1025: [ 1045,776 ], 1027: [ 1043,769 ],
1031: [ 1030,776 ], 1036: [ 1050,769 ], 1037: [ 1048,768 ], 1038: [ 1059,774 ], 1049: [ 1048,774 ],
1081: [ 1080,774 ], 1104: [ 1077,768 ], 1105: [ 1077,776 ], 1107: [ 1075,769 ], 1111: [ 1110,776 ],
1116: [ 1082,769 ], 1117: [ 1080,768 ], 1118: [ 1091,774 ], 1142: [ 1140,783 ], 1143: [ 1141,783 ],
1217: [ 1046,774 ], 1218: [ 1078,774 ], 1232: [ 1040,774 ], 1233: [ 1072,774 ], 1234: [ 1040,776 ],
1235: [ 1072,776 ], 1238: [ 1045,774 ], 1239: [ 1077,774 ], 1242: [ 1240,776 ], 1243: [ 1241,776 ],
1244: [ 1046,776 ], 1245: [ 1078,776 ], 1246: [ 1047,776 ], 1247: [ 1079,776 ], 1250: [ 1048,772 ],
1251: [ 1080,772 ], 1252: [ 1048,776 ], 1253: [ 1080,776 ], 1254: [ 1054,776 ], 1255: [ 1086,776 ],
1258: [ 1256,776 ], 1259: [ 1257,776 ], 1260: [ 1069,776 ], 1261: [ 1101,776 ], 1262: [ 1059,772 ],
1263: [ 1091,772 ], 1264: [ 1059,776 ], 1265: [ 1091,776 ], 1266: [ 1059,779 ], 1267: [ 1091,779 ],
1268: [ 1063,776 ], 1269: [ 1095,776 ], 1272: [ 1067,776 ], 1273: [ 1099,776 ], 1570: [ 1575,1619 ],
1571: [ 1575,1620 ], 1572: [ 1608,1620 ], 1573: [ 1575,1621 ], 1574: [ 1610,1620 ], 1728: [ 1749,1620 ],
1730: [ 1729,1620 ], 1747: [ 1746,1620 ], 2345: [ 2344,2364 ], 2353: [ 2352,2364 ], 2356: [ 2355,2364 ],
2392: [ 2325,2364 ], 2393: [ 2326,2364 ], 2394: [ 2327,2364 ], 2395: [ 2332,2364 ], 2396: [ 2337,2364 ],
2397: [ 2338,2364 ], 2398: [ 2347,2364 ], 2399: [ 2351,2364 ], 2507: [ 2503,2494 ], 2508: [ 2503,2519 ],
2524: [ 2465,2492 ], 2525: [ 2466,2492 ], 2527: [ 2479,2492 ], 2611: [ 2610,2620 ], 2614: [ 2616,2620 ],
2649: [ 2582,2620 ], 2650: [ 2583,2620 ], 2651: [ 2588,2620 ], 2654: [ 2603,2620 ], 2888: [ 2887,2902 ],
2891: [ 2887,2878 ], 2892: [ 2887,2903 ], 2908: [ 2849,2876 ], 2909: [ 2850,2876 ], 2964: [ 2962,3031 ],
3018: [ 3014,3006 ], 3019: [ 3015,3006 ], 3020: [ 3014,3031 ], 3144: [ 3142,3158 ], 3264: [ 3263,3285 ],
3271: [ 3270,3285 ], 3272: [ 3270,3286 ], 3274: [ 3270,3266 ], 3275: [ 3270,3266,3285 ], 3402: [ 3398,3390 ],
3403: [ 3399,3390 ], 3404: [ 3398,3415 ], 3546: [ 3545,3530 ], 3548: [ 3545,3535 ], 3549: [ 3545,3535,3530 ],
3550: [ 3545,3551 ], 3907: [ 3906,4023 ], 3917: [ 3916,4023 ], 3922: [ 3921,4023 ], 3927: [ 3926,4023 ],
3932: [ 3931,4023 ], 3945: [ 3904,4021 ], 3955: [ 3953,3954 ], 3957: [ 3953,3956 ], 3958: [ 4018,3968 ],
3960: [ 4019,3968 ], 3969: [ 3953,3968 ], 3987: [ 3986,4023 ], 3997: [ 3996,4023 ], 4002: [ 4001,4023 ],
4007: [ 4006,4023 ], 4012: [ 4011,4023 ], 4025: [ 3984,4021 ], 4134: [ 4133,4142 ], 7835: [ 383,775 ],
7960: [ 917,787 ], 7961: [ 917,788 ], 7962: [ 917,787,768 ], 7963: [ 917,788,768 ], 7964: [ 917,787,769 ],
7965: [ 917,788,769 ], 8008: [ 927,787 ], 8009: [ 927,788 ], 8010: [ 927,787,768 ], 8011: [ 927,788,768 ],
8012: [ 927,787,769 ], 8013: [ 927,788,769 ], 8016: [ 965,787 ], 8017: [ 965,788 ], 8018: [ 965,787,768 ],
8019: [ 965,788,768 ], 8020: [ 965,787,769 ], 8021: [ 965,788,769 ], 8022: [ 965,787,834 ], 8023: [ 965,788,834 ],
8025: [ 933,788 ], 8027: [ 933,788,768 ], 8029: [ 933,788,769 ], 8118: [ 945,834 ], 8119: [ 945,834,837 ],
8120: [ 913,774 ], 8121: [ 913,772 ], 8122: [ 913,768 ], 8123: [ 913,769 ], 8124: [ 913,837 ],
8126: 953, 8129: [ 168,834 ], 8130: [ 951,768,837 ], 8131: [ 951,837 ], 8132: [ 951,769,837 ],
8134: [ 951,834 ], 8135: [ 951,834,837 ], 8136: [ 917,768 ], 8137: [ 917,769 ], 8138: [ 919,768 ],
8139: [ 919,769 ], 8140: [ 919,837 ], 8141: [ 8127,768 ], 8142: [ 8127,769 ], 8143: [ 8127,834 ],
8144: [ 953,774 ], 8145: [ 953,772 ], 8146: [ 953,776,768 ], 8147: [ 953,776,769 ], 8150: [ 953,834 ],
8151: [ 953,776,834 ], 8152: [ 921,774 ], 8153: [ 921,772 ], 8154: [ 921,768 ], 8155: [ 921,769 ],
8178: [ 969,768,837 ], 8179: [ 969,837 ], 8180: [ 969,769,837 ], 8182: [ 969,834 ], 8183: [ 969,834,837 ],
8184: [ 927,768 ], 8185: [ 927,769 ], 8186: [ 937,768 ], 8187: [ 937,769 ], 8188: [ 937,837 ],
8189: 180, 8192: 8194, 8193: 8195, 8486: 937, 8490: 75,
8491: [ 65,778 ], 8602: [ 8592,824 ], 8603: [ 8594,824 ], 8622: [ 8596,824 ], 8653: [ 8656,824 ],
8654: [ 8660,824 ], 8655: [ 8658,824 ], 8708: [ 8707,824 ], 8713: [ 8712,824 ], 8716: [ 8715,824 ],
8740: [ 8739,824 ], 8742: [ 8741,824 ], 8769: [ 8764,824 ], 8772: [ 8771,824 ], 8775: [ 8773,824 ],
8777: [ 8776,824 ], 8800: [ 61,824 ], 8802: [ 8801,824 ], 8813: [ 8781,824 ], 8814: [ 60,824 ],
8815: [ 62,824 ], 8816: [ 8804,824 ], 8817: [ 8805,824 ], 8820: [ 8818,824 ], 8821: [ 8819,824 ],
8824: [ 8822,824 ], 8825: [ 8823,824 ], 8832: [ 8826,824 ], 8833: [ 8827,824 ], 8836: [ 8834,824 ],
8837: [ 8835,824 ], 8840: [ 8838,824 ], 8841: [ 8839,824 ], 8876: [ 8866,824 ], 8877: [ 8872,824 ],
8878: [ 8873,824 ], 8879: [ 8875,824 ], 8928: [ 8828,824 ], 8929: [ 8829,824 ], 8930: [ 8849,824 ],
8931: [ 8850,824 ], 8938: [ 8882,824 ], 8939: [ 8883,824 ], 8940: [ 8884,824 ], 8941: [ 8885,824 ],
9001: 12296, 9002: 12297, 10972: [ 10973,824 ], 12364: [ 12363,12441 ], 12366: [ 12365,12441 ],
12368: [ 12367,12441 ], 12370: [ 12369,12441 ], 12372: [ 12371,12441 ], 12374: [ 12373,12441 ], 12376: [ 12375,12441 ],
12378: [ 12377,12441 ], 12380: [ 12379,12441 ], 12382: [ 12381,12441 ], 12384: [ 12383,12441 ], 12386: [ 12385,12441 ],
12389: [ 12388,12441 ], 12391: [ 12390,12441 ], 12393: [ 12392,12441 ], 12400: [ 12399,12441 ], 12401: [ 12399,12442 ],
12403: [ 12402,12441 ], 12404: [ 12402,12442 ], 12406: [ 12405,12441 ], 12407: [ 12405,12442 ], 12409: [ 12408,12441 ],
12410: [ 12408,12442 ], 12412: [ 12411,12441 ], 12413: [ 12411,12442 ], 12436: [ 12358,12441 ], 12446: [ 12445,12441 ],
12460: [ 12459,12441 ], 12462: [ 12461,12441 ], 12464: [ 12463,12441 ], 12466: [ 12465,12441 ], 12468: [ 12467,12441 ],
12470: [ 12469,12441 ], 12472: [ 12471,12441 ], 12474: [ 12473,12441 ], 12476: [ 12475,12441 ], 12478: [ 12477,12441 ],
12480: [ 12479,12441 ], 12482: [ 12481,12441 ], 12485: [ 12484,12441 ], 12487: [ 12486,12441 ], 12489: [ 12488,12441 ],
12496: [ 12495,12441 ], 12497: [ 12495,12442 ], 12499: [ 12498,12441 ], 12500: [ 12498,12442 ], 12502: [ 12501,12441 ],
12503: [ 12501,12442 ], 12505: [ 12504,12441 ], 12506: [ 12504,12442 ], 12508: [ 12507,12441 ], 12509: [ 12507,12442 ],
12532: [ 12454,12441 ], 12535: [ 12527,12441 ], 12536: [ 12528,12441 ], 12537: [ 12529,12441 ], 12538: [ 12530,12441 ],
12542: [ 12541,12441 ], 64016: 22618, 64018: 26228, 64021: 20958, 64022: 29482,
64023: 30410, 64024: 31036, 64025: 31070, 64026: 31077, 64027: 31119,
64028: 38742, 64029: 31934, 64030: 32701, 64032: 34322, 64034: 35576,
64037: 36920, 64038: 37117, 64042: 39151, 64043: 39164, 64044: 39208,
64045: 40372, 64285: [ 1497,1460 ], 64287: [ 1522,1463 ], 64298: [ 1513,1473 ], 64299: [ 1513,1474 ],
64300: [ 1513,1468,1473 ], 64301: [ 1513,1468,1474 ], 64302: [ 1488,1463 ], 64303: [ 1488,1464 ], 64304: [ 1488,1468 ],
64305: [ 1489,1468 ], 64306: [ 1490,1468 ], 64307: [ 1491,1468 ], 64308: [ 1492,1468 ], 64309: [ 1493,1468 ],
64310: [ 1494,1468 ], 64312: [ 1496,1468 ], 64313: [ 1497,1468 ], 64314: [ 1498,1468 ], 64315: [ 1499,1468 ],
64316: [ 1500,1468 ], 64318: [ 1502,1468 ], 64320: [ 1504,1468 ], 64321: [ 1505,1468 ], 64323: [ 1507,1468 ],
64324: [ 1508,1468 ], 64326: [ 1510,1468 ], 64327: [ 1511,1468 ], 64328: [ 1512,1468 ], 64329: [ 1513,1468 ],
64330: [ 1514,1468 ], 64331: [ 1493,1465 ], 64332: [ 1489,1471 ], 64333: [ 1499,1471 ], 64334: [ 1508,1471 ],
119134: [ 119127,119141 ], 119135: [ 119128,119141 ], 119136: [ 119128,119141,119150 ], 119137: [ 119128,119141,119151 ], 119138: [ 119128,119141,119152 ],
119139: [ 119128,119141,119153 ], 119140: [ 119128,119141,119154 ], 119227: [ 119225,119141 ], 119228: [ 119226,119141 ], 119229: [ 119225,119141,119150 ],
119230: [ 119226,119141,119150 ], 119231: [ 119225,119141,119151 ], 119232: [ 119226,119141,119151 ]
};
/* add all the regular cases to unicode_decomp_table */
(function() {
  var ls, ix, val;
  var map = unicode_decomp_table;
  ls = [
[121,776], [65,772], [97,772], [65,774], [97,774], [65,808], [97,808], [67,769],
[99,769], [67,770], [99,770], [67,775], [99,775], [67,780], [99,780], [68,780],
[100,780],
  ];
  for (ix=0; ix<17; ix++) {
    val = ls[ix];
    map[ix+255] = val;
  }
  ls = [
[69,772], [101,772], [69,774], [101,774], [69,775], [101,775], [69,808], [101,808],
[69,780], [101,780], [71,770], [103,770], [71,774], [103,774], [71,775], [103,775],
[71,807], [103,807], [72,770], [104,770],
  ];
  for (ix=0; ix<20; ix++) {
    val = ls[ix];
    map[ix+274] = val;
  }
  ls = [
[82,769], [114,769], [82,807], [114,807], [82,780], [114,780], [83,769], [115,769],
[83,770], [115,770], [83,807], [115,807], [83,780], [115,780], [84,807], [116,807],
[84,780], [116,780],
  ];
  for (ix=0; ix<18; ix++) {
    val = ls[ix];
    map[ix+340] = val;
  }
  ls = [
[85,771], [117,771], [85,772], [117,772], [85,774], [117,774], [85,778], [117,778],
[85,779], [117,779], [85,808], [117,808], [87,770], [119,770], [89,770], [121,770],
[89,776], [90,769], [122,769], [90,775], [122,775], [90,780], [122,780],
  ];
  for (ix=0; ix<23; ix++) {
    val = ls[ix];
    map[ix+360] = val;
  }
  ls = [
[65,780], [97,780], [73,780], [105,780], [79,780], [111,780], [85,780], [117,780],
[85,776,772], [117,776,772], [85,776,769], [117,776,769], [85,776,780], [117,776,780], [85,776,768], [117,776,768],
  ];
  for (ix=0; ix<16; ix++) {
    val = ls[ix];
    map[ix+461] = val;
  }
  ls = [
[78,768], [110,768], [65,778,769], [97,778,769], [198,769], [230,769], [216,769], [248,769],
[65,783], [97,783], [65,785], [97,785], [69,783], [101,783], [69,785], [101,785],
[73,783], [105,783], [73,785], [105,785], [79,783], [111,783], [79,785], [111,785],
[82,783], [114,783], [82,785], [114,785], [85,783], [117,783], [85,785], [117,785],
[83,806], [115,806], [84,806], [116,806],
  ];
  for (ix=0; ix<36; ix++) {
    val = ls[ix];
    map[ix+504] = val;
  }
  ls = [
[65,805], [97,805], [66,775], [98,775], [66,803], [98,803], [66,817], [98,817],
[67,807,769], [99,807,769], [68,775], [100,775], [68,803], [100,803], [68,817], [100,817],
[68,807], [100,807], [68,813], [100,813], [69,772,768], [101,772,768], [69,772,769], [101,772,769],
[69,813], [101,813], [69,816], [101,816], [69,807,774], [101,807,774], [70,775], [102,775],
[71,772], [103,772], [72,775], [104,775], [72,803], [104,803], [72,776], [104,776],
[72,807], [104,807], [72,814], [104,814], [73,816], [105,816], [73,776,769], [105,776,769],
[75,769], [107,769], [75,803], [107,803], [75,817], [107,817], [76,803], [108,803],
[76,803,772], [108,803,772], [76,817], [108,817], [76,813], [108,813], [77,769], [109,769],
[77,775], [109,775], [77,803], [109,803], [78,775], [110,775], [78,803], [110,803],
[78,817], [110,817], [78,813], [110,813], [79,771,769], [111,771,769], [79,771,776], [111,771,776],
[79,772,768], [111,772,768], [79,772,769], [111,772,769], [80,769], [112,769], [80,775], [112,775],
[82,775], [114,775], [82,803], [114,803], [82,803,772], [114,803,772], [82,817], [114,817],
[83,775], [115,775], [83,803], [115,803], [83,769,775], [115,769,775], [83,780,775], [115,780,775],
[83,803,775], [115,803,775], [84,775], [116,775], [84,803], [116,803], [84,817], [116,817],
[84,813], [116,813], [85,804], [117,804], [85,816], [117,816], [85,813], [117,813],
[85,771,769], [117,771,769], [85,772,776], [117,772,776], [86,771], [118,771], [86,803], [118,803],
[87,768], [119,768], [87,769], [119,769], [87,776], [119,776], [87,775], [119,775],
[87,803], [119,803], [88,775], [120,775], [88,776], [120,776], [89,775], [121,775],
[90,770], [122,770], [90,803], [122,803], [90,817], [122,817], [104,817], [116,776],
[119,778], [121,778],
  ];
  for (ix=0; ix<154; ix++) {
    val = ls[ix];
    map[ix+7680] = val;
  }
  ls = [
[65,803], [97,803], [65,777], [97,777], [65,770,769], [97,770,769], [65,770,768], [97,770,768],
[65,770,777], [97,770,777], [65,770,771], [97,770,771], [65,803,770], [97,803,770], [65,774,769], [97,774,769],
[65,774,768], [97,774,768], [65,774,777], [97,774,777], [65,774,771], [97,774,771], [65,803,774], [97,803,774],
[69,803], [101,803], [69,777], [101,777], [69,771], [101,771], [69,770,769], [101,770,769],
[69,770,768], [101,770,768], [69,770,777], [101,770,777], [69,770,771], [101,770,771], [69,803,770], [101,803,770],
[73,777], [105,777], [73,803], [105,803], [79,803], [111,803], [79,777], [111,777],
[79,770,769], [111,770,769], [79,770,768], [111,770,768], [79,770,777], [111,770,777], [79,770,771], [111,770,771],
[79,803,770], [111,803,770], [79,795,769], [111,795,769], [79,795,768], [111,795,768], [79,795,777], [111,795,777],
[79,795,771], [111,795,771], [79,795,803], [111,795,803], [85,803], [117,803], [85,777], [117,777],
[85,795,769], [117,795,769], [85,795,768], [117,795,768], [85,795,777], [117,795,777], [85,795,771], [117,795,771],
[85,795,803], [117,795,803], [89,768], [121,768], [89,803], [121,803], [89,777], [121,777],
[89,771], [121,771],
  ];
  for (ix=0; ix<90; ix++) {
    val = ls[ix];
    map[ix+7840] = val;
  }
  ls = [
[945,787], [945,788], [945,787,768], [945,788,768], [945,787,769], [945,788,769], [945,787,834], [945,788,834],
[913,787], [913,788], [913,787,768], [913,788,768], [913,787,769], [913,788,769], [913,787,834], [913,788,834],
[949,787], [949,788], [949,787,768], [949,788,768], [949,787,769], [949,788,769],
  ];
  for (ix=0; ix<22; ix++) {
    val = ls[ix];
    map[ix+7936] = val;
  }
  ls = [
[951,787], [951,788], [951,787,768], [951,788,768], [951,787,769], [951,788,769], [951,787,834], [951,788,834],
[919,787], [919,788], [919,787,768], [919,788,768], [919,787,769], [919,788,769], [919,787,834], [919,788,834],
[953,787], [953,788], [953,787,768], [953,788,768], [953,787,769], [953,788,769], [953,787,834], [953,788,834],
[921,787], [921,788], [921,787,768], [921,788,768], [921,787,769], [921,788,769], [921,787,834], [921,788,834],
[959,787], [959,788], [959,787,768], [959,788,768], [959,787,769], [959,788,769],
  ];
  for (ix=0; ix<38; ix++) {
    val = ls[ix];
    map[ix+7968] = val;
  }
  ls = [
[933,788,834], [969,787], [969,788], [969,787,768], [969,788,768], [969,787,769], [969,788,769], [969,787,834],
[969,788,834], [937,787], [937,788], [937,787,768], [937,788,768], [937,787,769], [937,788,769], [937,787,834],
[937,788,834], [945,768], [945,769], [949,768], [949,769], [951,768], [951,769], [953,768],
[953,769], [959,768], [959,769], [965,768], [965,769], [969,768], [969,769],
  ];
  for (ix=0; ix<31; ix++) {
    val = ls[ix];
    map[ix+8031] = val;
  }
  ls = [
[945,787,837], [945,788,837], [945,787,768,837], [945,788,768,837], [945,787,769,837], [945,788,769,837], [945,787,834,837], [945,788,834,837],
[913,787,837], [913,788,837], [913,787,768,837], [913,788,768,837], [913,787,769,837], [913,788,769,837], [913,787,834,837], [913,788,834,837],
[951,787,837], [951,788,837], [951,787,768,837], [951,788,768,837], [951,787,769,837], [951,788,769,837], [951,787,834,837], [951,788,834,837],
[919,787,837], [919,788,837], [919,787,768,837], [919,788,768,837], [919,787,769,837], [919,788,769,837], [919,787,834,837], [919,788,834,837],
[969,787,837], [969,788,837], [969,787,768,837], [969,788,768,837], [969,787,769,837], [969,788,769,837], [969,787,834,837], [969,788,834,837],
[937,787,837], [937,788,837], [937,787,768,837], [937,788,768,837], [937,787,769,837], [937,788,769,837], [937,787,834,837], [937,788,834,837],
[945,774], [945,772], [945,768,837], [945,837], [945,769,837],
  ];
  for (ix=0; ix<53; ix++) {
    val = ls[ix];
    map[ix+8064] = val;
  }
  ls = [
[8190,768], [8190,769], [8190,834], [965,774], [965,772], [965,776,768], [965,776,769], [961,787],
[961,788], [965,834], [965,776,834], [933,774], [933,772], [933,768], [933,769], [929,788],
[168,768], [168,769], 96,
  ];
  for (ix=0; ix<19; ix++) {
    val = ls[ix];
    map[ix+8157] = val;
  }
  ls = [
35912, 26356, 36554, 36040, 28369, 20018, 21477, 40860,
40860, 22865, 37329, 21895, 22856, 25078, 30313, 32645,
34367, 34746, 35064, 37007, 27138, 27931, 28889, 29662,
33853, 37226, 39409, 20098, 21365, 27396, 29211, 34349,
40478, 23888, 28651, 34253, 35172, 25289, 33240, 34847,
24266, 26391, 28010, 29436, 37070, 20358, 20919, 21214,
25796, 27347, 29200, 30439, 32769, 34310, 34396, 36335,
38706, 39791, 40442, 30860, 31103, 32160, 33737, 37636,
40575, 35542, 22751, 24324, 31840, 32894, 29282, 30922,
36034, 38647, 22744, 23650, 27155, 28122, 28431, 32047,
32311, 38475, 21202, 32907, 20956, 20940, 31260, 32190,
33777, 38517, 35712, 25295, 27138, 35582, 20025, 23527,
24594, 29575, 30064, 21271, 30971, 20415, 24489, 19981,
27852, 25976, 32034, 21443, 22622, 30465, 33865, 35498,
27578, 36784, 27784, 25342, 33509, 25504, 30053, 20142,
20841, 20937, 26753, 31975, 33391, 35538, 37327, 21237,
21570, 22899, 24300, 26053, 28670, 31018, 38317, 39530,
40599, 40654, 21147, 26310, 27511, 36706, 24180, 24976,
25088, 25754, 28451, 29001, 29833, 31178, 32244, 32879,
36646, 34030, 36899, 37706, 21015, 21155, 21693, 28872,
35010, 35498, 24265, 24565, 25467, 27566, 31806, 29557,
20196, 22265, 23527, 23994, 24604, 29618, 29801, 32666,
32838, 37428, 38646, 38728, 38936, 20363, 31150, 37300,
38584, 24801, 20102, 20698, 23534, 23615, 26009, 27138,
29134, 30274, 34044, 36988, 40845, 26248, 38446, 21129,
26491, 26611, 27969, 28316, 29705, 30041, 30827, 32016,
39006, 20845, 25134, 38520, 20523, 23833, 28138, 36650,
24459, 24900, 26647, 29575, 38534, 21033, 21519, 23653,
26131, 26446, 26792, 27877, 29702, 30178, 32633, 35023,
35041, 37324, 38626, 21311, 28346, 21533, 29136, 29848,
34298, 38563, 40023, 40607, 26519, 28107, 33256, 31435,
31520, 31890, 29376, 28825, 35672, 20160, 33590, 21050,
20999, 24230, 25299, 31958, 23429, 27934, 26292, 36667,
34892, 38477, 35211, 24275, 20800, 21952,
  ];
  for (ix=0; ix<270; ix++) {
    val = ls[ix];
    map[ix+63744] = val;
  }
  ls = [
20398, 20711, 20813, 21193, 21220, 21329, 21917, 22022,
22120, 22592, 22696, 23652, 23662, 24724, 24936, 24974,
25074, 25935, 26082, 26257, 26757, 28023, 28186, 28450,
29038, 29227, 29730, 30865, 31038, 31049, 31048, 31056,
31062, 31069, 31117, 31118, 31296, 31361, 31680, 32244,
32265, 32321, 32626, 32773, 33261, 33401, 33401, 33879,
35088, 35222, 35585, 35641, 36051, 36104, 36790, 36920,
38627, 38911, 38971,
  ];
  for (ix=0; ix<59; ix++) {
    val = ls[ix];
    map[ix+64048] = val;
  }
  ls = [
20029, 20024, 20033, 131362, 20320, 20398, 20411, 20482,
20602, 20633, 20711, 20687, 13470, 132666, 20813, 20820,
20836, 20855, 132380, 13497, 20839, 20877, 132427, 20887,
20900, 20172, 20908, 20917, 168415, 20981, 20995, 13535,
21051, 21062, 21106, 21111, 13589, 21191, 21193, 21220,
21242, 21253, 21254, 21271, 21321, 21329, 21338, 21363,
21373, 21375, 21375, 21375, 133676, 28784, 21450, 21471,
133987, 21483, 21489, 21510, 21662, 21560, 21576, 21608,
21666, 21750, 21776, 21843, 21859, 21892, 21892, 21913,
21931, 21939, 21954, 22294, 22022, 22295, 22097, 22132,
20999, 22766, 22478, 22516, 22541, 22411, 22578, 22577,
22700, 136420, 22770, 22775, 22790, 22810, 22818, 22882,
136872, 136938, 23020, 23067, 23079, 23000, 23142, 14062,
14076, 23304, 23358, 23358, 137672, 23491, 23512, 23527,
23539, 138008, 23551, 23558, 24403, 23586, 14209, 23648,
23662, 23744, 23693, 138724, 23875, 138726, 23918, 23915,
23932, 24033, 24034, 14383, 24061, 24104, 24125, 24169,
14434, 139651, 14460, 24240, 24243, 24246, 24266, 172946,
24318, 140081, 140081, 33281, 24354, 24354, 14535, 144056,
156122, 24418, 24427, 14563, 24474, 24525, 24535, 24569,
24705, 14650, 14620, 24724, 141012, 24775, 24904, 24908,
24910, 24908, 24954, 24974, 25010, 24996, 25007, 25054,
25074, 25078, 25104, 25115, 25181, 25265, 25300, 25424,
142092, 25405, 25340, 25448, 25475, 25572, 142321, 25634,
25541, 25513, 14894, 25705, 25726, 25757, 25719, 14956,
25935, 25964, 143370, 26083, 26360, 26185, 15129, 26257,
15112, 15076, 20882, 20885, 26368, 26268, 32941, 17369,
26391, 26395, 26401, 26462, 26451, 144323, 15177, 26618,
26501, 26706, 26757, 144493, 26766, 26655, 26900, 15261,
26946, 27043, 27114, 27304, 145059, 27355, 15384, 27425,
145575, 27476, 15438, 27506, 27551, 27578, 27579, 146061,
138507, 146170, 27726, 146620, 27839, 27853, 27751, 27926,
27966, 28023, 27969, 28009, 28024, 28037, 146718, 27956,
28207, 28270, 15667, 28363, 28359, 147153, 28153, 28526,
147294, 147342, 28614, 28729, 28702, 28699, 15766, 28746,
28797, 28791, 28845, 132389, 28997, 148067, 29084, 148395,
29224, 29237, 29264, 149000, 29312, 29333, 149301, 149524,
29562, 29579, 16044, 29605, 16056, 16056, 29767, 29788,
29809, 29829, 29898, 16155, 29988, 150582, 30014, 150674,
30064, 139679, 30224, 151457, 151480, 151620, 16380, 16392,
30452, 151795, 151794, 151833, 151859, 30494, 30495, 30495,
30538, 16441, 30603, 16454, 16534, 152605, 30798, 30860,
30924, 16611, 153126, 31062, 153242, 153285, 31119, 31211,
16687, 31296, 31306, 31311, 153980, 154279, 154279, 31470,
16898, 154539, 31686, 31689, 16935, 154752, 31954, 17056,
31976, 31971, 32000, 155526, 32099, 17153, 32199, 32258,
32325, 17204, 156200, 156231, 17241, 156377, 32634, 156478,
32661, 32762, 32773, 156890, 156963, 32864, 157096, 32880,
144223, 17365, 32946, 33027, 17419, 33086, 23221, 157607,
157621, 144275, 144284, 33281, 33284, 36766, 17515, 33425,
33419, 33437, 21171, 33457, 33459, 33469, 33510, 158524,
33509, 33565, 33635, 33709, 33571, 33725, 33767, 33879,
33619, 33738, 33740, 33756, 158774, 159083, 158933, 17707,
34033, 34035, 34070, 160714, 34148, 159532, 17757, 17761,
159665, 159954, 17771, 34384, 34396, 34407, 34409, 34473,
34440, 34574, 34530, 34681, 34600, 34667, 34694, 17879,
34785, 34817, 17913, 34912, 34915, 161383, 35031, 35038,
17973, 35066, 13499, 161966, 162150, 18110, 18119, 35488,
35565, 35722, 35925, 162984, 36011, 36033, 36123, 36215,
163631, 133124, 36299, 36284, 36336, 133342, 36564, 36664,
165330, 165357, 37012, 37105, 37137, 165678, 37147, 37432,
37591, 37592, 37500, 37881, 37909, 166906, 38283, 18837,
38327, 167287, 18918, 38595, 23986, 38691, 168261, 168474,
19054, 19062, 38880, 168970, 19122, 169110, 38923, 38923,
38953, 169398, 39138, 19251, 39209, 39335, 39362, 39422,
19406, 170800, 39698, 40000, 40189, 19662, 19693, 40295,
172238, 19704, 172293, 172558, 172689, 40635, 19798, 40697,
40702, 40709, 40719, 40726, 40763, 173568,
  ];
  for (ix=0; ix<542; ix++) {
    val = ls[ix];
    map[ix+194560] = val;
  }
})();

/* list all the special cases in unicode_combin_table */
var unicode_combin_table = {
768: 230, 769: 230, 770: 230, 771: 230, 772: 230,
773: 230, 774: 230, 775: 230, 776: 230, 777: 230,
778: 230, 779: 230, 780: 230, 781: 230, 782: 230,
783: 230, 784: 230, 785: 230, 786: 230, 787: 230,
788: 230, 789: 232, 790: 220, 791: 220, 792: 220,
793: 220, 794: 232, 795: 216, 796: 220, 797: 220,
798: 220, 799: 220, 800: 220, 801: 202, 802: 202,
803: 220, 804: 220, 805: 220, 806: 220, 807: 202,
808: 202, 809: 220, 810: 220, 811: 220, 812: 220,
813: 220, 814: 220, 815: 220, 816: 220, 817: 220,
818: 220, 819: 220, 820: 1, 821: 1, 822: 1,
823: 1, 824: 1, 825: 220, 826: 220, 827: 220,
828: 220, 829: 230, 830: 230, 831: 230, 832: 230,
833: 230, 834: 230, 835: 230, 836: 230, 837: 240,
838: 230, 839: 220, 840: 220, 841: 220, 842: 230,
843: 230, 844: 230, 845: 220, 846: 220, 848: 230,
849: 230, 850: 230, 851: 220, 852: 220, 853: 220,
854: 220, 855: 230, 861: 234, 862: 234, 863: 233,
864: 234, 865: 234, 866: 233, 867: 230, 868: 230,
869: 230, 870: 230, 871: 230, 872: 230, 873: 230,
874: 230, 875: 230, 876: 230, 877: 230, 878: 230,
879: 230, 1155: 230, 1156: 230, 1157: 230, 1158: 230,
1425: 220, 1426: 230, 1427: 230, 1428: 230, 1429: 230,
1430: 220, 1431: 230, 1432: 230, 1433: 230, 1434: 222,
1435: 220, 1436: 230, 1437: 230, 1438: 230, 1439: 230,
1440: 230, 1441: 230, 1443: 220, 1444: 220, 1445: 220,
1446: 220, 1447: 220, 1448: 230, 1449: 230, 1450: 220,
1451: 230, 1452: 230, 1453: 222, 1454: 228, 1455: 230,
1456: 10, 1457: 11, 1458: 12, 1459: 13, 1460: 14,
1461: 15, 1462: 16, 1463: 17, 1464: 18, 1465: 19,
1467: 20, 1468: 21, 1469: 22, 1471: 23, 1473: 24,
1474: 25, 1476: 230, 1552: 230, 1553: 230, 1554: 230,
1555: 230, 1556: 230, 1557: 230, 1611: 27, 1612: 28,
1613: 29, 1614: 30, 1615: 31, 1616: 32, 1617: 33,
1618: 34, 1619: 230, 1620: 230, 1621: 220, 1622: 220,
1623: 230, 1624: 230, 1648: 35, 1750: 230, 1751: 230,
1752: 230, 1753: 230, 1754: 230, 1755: 230, 1756: 230,
1759: 230, 1760: 230, 1761: 230, 1762: 230, 1763: 220,
1764: 230, 1767: 230, 1768: 230, 1770: 220, 1771: 230,
1772: 230, 1773: 220, 1809: 36, 1840: 230, 1841: 220,
1842: 230, 1843: 230, 1844: 220, 1845: 230, 1846: 230,
1847: 220, 1848: 220, 1849: 220, 1850: 230, 1851: 220,
1852: 220, 1853: 230, 1854: 220, 1855: 230, 1856: 230,
1857: 230, 1858: 220, 1859: 230, 1860: 220, 1861: 230,
1862: 220, 1863: 230, 1864: 220, 1865: 230, 1866: 230,
2364: 7, 2381: 9, 2385: 230, 2386: 220, 2387: 230,
2388: 230, 2492: 7, 2509: 9, 2620: 7, 2637: 9,
2748: 7, 2765: 9, 2876: 7, 2893: 9, 3021: 9,
3149: 9, 3157: 84, 3158: 91, 3260: 7, 3277: 9,
3405: 9, 3530: 9, 3640: 103, 3641: 103, 3642: 9,
3656: 107, 3657: 107, 3658: 107, 3659: 107, 3768: 118,
3769: 118, 3784: 122, 3785: 122, 3786: 122, 3787: 122,
3864: 220, 3865: 220, 3893: 220, 3895: 220, 3897: 216,
3953: 129, 3954: 130, 3956: 132, 3962: 130, 3963: 130,
3964: 130, 3965: 130, 3968: 130, 3970: 230, 3971: 230,
3972: 9, 3974: 230, 3975: 230, 4038: 220, 4151: 7,
4153: 9, 5908: 9, 5940: 9, 6098: 9, 6109: 230,
6313: 228, 6457: 222, 6458: 230, 6459: 220, 8400: 230,
8401: 230, 8402: 1, 8403: 1, 8404: 230, 8405: 230,
8406: 230, 8407: 230, 8408: 1, 8409: 1, 8410: 1,
8411: 230, 8412: 230, 8417: 230, 8421: 1, 8422: 1,
8423: 230, 8424: 220, 8425: 230, 8426: 1, 12330: 218,
12331: 228, 12332: 232, 12333: 222, 12334: 224, 12335: 224,
12441: 8, 12442: 8, 64286: 26, 65056: 230, 65057: 230,
65058: 230, 65059: 230, 119141: 216, 119142: 216, 119143: 1,
119144: 1, 119145: 1, 119149: 226, 119150: 216, 119151: 216,
119152: 216, 119153: 216, 119154: 216, 119163: 220, 119164: 220,
119165: 220, 119166: 220, 119167: 220, 119168: 220, 119169: 220,
119170: 220, 119173: 230, 119174: 230, 119175: 230, 119176: 230,
119177: 230, 119178: 220, 119179: 220, 119210: 230, 119211: 230,
119212: 230, 119213: 230
};

/* list all of unicode_compo_table */
var unicode_compo_table = {
 60: { 824:8814 },
 61: { 824:8800 },
 62: { 824:8815 },
 65: { 768:192, 769:193, 770:194, 771:195, 772:256, 774:258, 775:550, 776:196, 777:7842, 778:197, 780:461, 783:512, 785:514, 803:7840, 805:7680, 808:260 },
 66: { 775:7682, 803:7684, 817:7686 },
 67: { 769:262, 770:264, 775:266, 780:268, 807:199 },
 68: { 775:7690, 780:270, 803:7692, 807:7696, 813:7698, 817:7694 },
 69: { 768:200, 769:201, 770:202, 771:7868, 772:274, 774:276, 775:278, 776:203, 777:7866, 780:282, 783:516, 785:518, 803:7864, 807:552, 808:280, 813:7704, 816:7706 },
 70: { 775:7710 },
 71: { 769:500, 770:284, 772:7712, 774:286, 775:288, 780:486, 807:290 },
 72: { 770:292, 775:7714, 776:7718, 780:542, 803:7716, 807:7720, 814:7722 },
 73: { 768:204, 769:205, 770:206, 771:296, 772:298, 774:300, 775:304, 776:207, 777:7880, 780:463, 783:520, 785:522, 803:7882, 808:302, 816:7724 },
 74: { 770:308 },
 75: { 769:7728, 780:488, 803:7730, 807:310, 817:7732 },
 76: { 769:313, 780:317, 803:7734, 807:315, 813:7740, 817:7738 },
 77: { 769:7742, 775:7744, 803:7746 },
 78: { 768:504, 769:323, 771:209, 775:7748, 780:327, 803:7750, 807:325, 813:7754, 817:7752 },
 79: { 768:210, 769:211, 770:212, 771:213, 772:332, 774:334, 775:558, 776:214, 777:7886, 779:336, 780:465, 783:524, 785:526, 795:416, 803:7884, 808:490 },
 80: { 769:7764, 775:7766 },
 82: { 769:340, 775:7768, 780:344, 783:528, 785:530, 803:7770, 807:342, 817:7774 },
 83: { 769:346, 770:348, 775:7776, 780:352, 803:7778, 806:536, 807:350 },
 84: { 775:7786, 780:356, 803:7788, 806:538, 807:354, 813:7792, 817:7790 },
 85: { 768:217, 769:218, 770:219, 771:360, 772:362, 774:364, 776:220, 777:7910, 778:366, 779:368, 780:467, 783:532, 785:534, 795:431, 803:7908, 804:7794, 808:370, 813:7798, 816:7796 },
 86: { 771:7804, 803:7806 },
 87: { 768:7808, 769:7810, 770:372, 775:7814, 776:7812, 803:7816 },
 88: { 775:7818, 776:7820 },
 89: { 768:7922, 769:221, 770:374, 771:7928, 772:562, 775:7822, 776:376, 777:7926, 803:7924 },
 90: { 769:377, 770:7824, 775:379, 780:381, 803:7826, 817:7828 },
 97: { 768:224, 769:225, 770:226, 771:227, 772:257, 774:259, 775:551, 776:228, 777:7843, 778:229, 780:462, 783:513, 785:515, 803:7841, 805:7681, 808:261 },
 98: { 775:7683, 803:7685, 817:7687 },
 99: { 769:263, 770:265, 775:267, 780:269, 807:231 },
 100: { 775:7691, 780:271, 803:7693, 807:7697, 813:7699, 817:7695 },
 101: { 768:232, 769:233, 770:234, 771:7869, 772:275, 774:277, 775:279, 776:235, 777:7867, 780:283, 783:517, 785:519, 803:7865, 807:553, 808:281, 813:7705, 816:7707 },
 102: { 775:7711 },
 103: { 769:501, 770:285, 772:7713, 774:287, 775:289, 780:487, 807:291 },
 104: { 770:293, 775:7715, 776:7719, 780:543, 803:7717, 807:7721, 814:7723, 817:7830 },
 105: { 768:236, 769:237, 770:238, 771:297, 772:299, 774:301, 776:239, 777:7881, 780:464, 783:521, 785:523, 803:7883, 808:303, 816:7725 },
 106: { 770:309, 780:496 },
 107: { 769:7729, 780:489, 803:7731, 807:311, 817:7733 },
 108: { 769:314, 780:318, 803:7735, 807:316, 813:7741, 817:7739 },
 109: { 769:7743, 775:7745, 803:7747 },
 110: { 768:505, 769:324, 771:241, 775:7749, 780:328, 803:7751, 807:326, 813:7755, 817:7753 },
 111: { 768:242, 769:243, 770:244, 771:245, 772:333, 774:335, 775:559, 776:246, 777:7887, 779:337, 780:466, 783:525, 785:527, 795:417, 803:7885, 808:491 },
 112: { 769:7765, 775:7767 },
 114: { 769:341, 775:7769, 780:345, 783:529, 785:531, 803:7771, 807:343, 817:7775 },
 115: { 769:347, 770:349, 775:7777, 780:353, 803:7779, 806:537, 807:351 },
 116: { 775:7787, 776:7831, 780:357, 803:7789, 806:539, 807:355, 813:7793, 817:7791 },
 117: { 768:249, 769:250, 770:251, 771:361, 772:363, 774:365, 776:252, 777:7911, 778:367, 779:369, 780:468, 783:533, 785:535, 795:432, 803:7909, 804:7795, 808:371, 813:7799, 816:7797 },
 118: { 771:7805, 803:7807 },
 119: { 768:7809, 769:7811, 770:373, 775:7815, 776:7813, 778:7832, 803:7817 },
 120: { 775:7819, 776:7821 },
 121: { 768:7923, 769:253, 770:375, 771:7929, 772:563, 775:7823, 776:255, 777:7927, 778:7833, 803:7925 },
 122: { 769:378, 770:7825, 775:380, 780:382, 803:7827, 817:7829 },
 168: { 768:8173, 769:901, 834:8129 },
 194: { 768:7846, 769:7844, 771:7850, 777:7848 },
 196: { 772:478 },
 197: { 769:506 },
 198: { 769:508, 772:482 },
 199: { 769:7688 },
 202: { 768:7872, 769:7870, 771:7876, 777:7874 },
 207: { 769:7726 },
 212: { 768:7890, 769:7888, 771:7894, 777:7892 },
 213: { 769:7756, 772:556, 776:7758 },
 214: { 772:554 },
 216: { 769:510 },
 220: { 768:475, 769:471, 772:469, 780:473 },
 226: { 768:7847, 769:7845, 771:7851, 777:7849 },
 228: { 772:479 },
 229: { 769:507 },
 230: { 769:509, 772:483 },
 231: { 769:7689 },
 234: { 768:7873, 769:7871, 771:7877, 777:7875 },
 239: { 769:7727 },
 244: { 768:7891, 769:7889, 771:7895, 777:7893 },
 245: { 769:7757, 772:557, 776:7759 },
 246: { 772:555 },
 248: { 769:511 },
 252: { 768:476, 769:472, 772:470, 780:474 },
 258: { 768:7856, 769:7854, 771:7860, 777:7858 },
 259: { 768:7857, 769:7855, 771:7861, 777:7859 },
 274: { 768:7700, 769:7702 },
 275: { 768:7701, 769:7703 },
 332: { 768:7760, 769:7762 },
 333: { 768:7761, 769:7763 },
 346: { 775:7780 },
 347: { 775:7781 },
 352: { 775:7782 },
 353: { 775:7783 },
 360: { 769:7800 },
 361: { 769:7801 },
 362: { 776:7802 },
 363: { 776:7803 },
 383: { 775:7835 },
 416: { 768:7900, 769:7898, 771:7904, 777:7902, 803:7906 },
 417: { 768:7901, 769:7899, 771:7905, 777:7903, 803:7907 },
 431: { 768:7914, 769:7912, 771:7918, 777:7916, 803:7920 },
 432: { 768:7915, 769:7913, 771:7919, 777:7917, 803:7921 },
 439: { 780:494 },
 490: { 772:492 },
 491: { 772:493 },
 550: { 772:480 },
 551: { 772:481 },
 552: { 774:7708 },
 553: { 774:7709 },
 558: { 772:560 },
 559: { 772:561 },
 658: { 780:495 },
 776: { 769:836 },
 913: { 768:8122, 769:902, 772:8121, 774:8120, 787:7944, 788:7945, 837:8124 },
 917: { 768:8136, 769:904, 787:7960, 788:7961 },
 919: { 768:8138, 769:905, 787:7976, 788:7977, 837:8140 },
 921: { 768:8154, 769:906, 772:8153, 774:8152, 776:938, 787:7992, 788:7993 },
 927: { 768:8184, 769:908, 787:8008, 788:8009 },
 929: { 788:8172 },
 933: { 768:8170, 769:910, 772:8169, 774:8168, 776:939, 788:8025 },
 937: { 768:8186, 769:911, 787:8040, 788:8041, 837:8188 },
 940: { 837:8116 },
 942: { 837:8132 },
 945: { 768:8048, 769:940, 772:8113, 774:8112, 787:7936, 788:7937, 834:8118, 837:8115 },
 949: { 768:8050, 769:941, 787:7952, 788:7953 },
 951: { 768:8052, 769:942, 787:7968, 788:7969, 834:8134, 837:8131 },
 953: { 768:8054, 769:943, 772:8145, 774:8144, 776:970, 787:7984, 788:7985, 834:8150 },
 959: { 768:8056, 769:972, 787:8000, 788:8001 },
 961: { 787:8164, 788:8165 },
 965: { 768:8058, 769:973, 772:8161, 774:8160, 776:971, 787:8016, 788:8017, 834:8166 },
 969: { 768:8060, 769:974, 787:8032, 788:8033, 834:8182, 837:8179 },
 970: { 768:8146, 769:912, 834:8151 },
 971: { 768:8162, 769:944, 834:8167 },
 974: { 837:8180 },
 978: { 769:979, 776:980 },
 1030: { 776:1031 },
 1040: { 774:1232, 776:1234 },
 1043: { 769:1027 },
 1045: { 768:1024, 774:1238, 776:1025 },
 1046: { 774:1217, 776:1244 },
 1047: { 776:1246 },
 1048: { 768:1037, 772:1250, 774:1049, 776:1252 },
 1050: { 769:1036 },
 1054: { 776:1254 },
 1059: { 772:1262, 774:1038, 776:1264, 779:1266 },
 1063: { 776:1268 },
 1067: { 776:1272 },
 1069: { 776:1260 },
 1072: { 774:1233, 776:1235 },
 1075: { 769:1107 },
 1077: { 768:1104, 774:1239, 776:1105 },
 1078: { 774:1218, 776:1245 },
 1079: { 776:1247 },
 1080: { 768:1117, 772:1251, 774:1081, 776:1253 },
 1082: { 769:1116 },
 1086: { 776:1255 },
 1091: { 772:1263, 774:1118, 776:1265, 779:1267 },
 1095: { 776:1269 },
 1099: { 776:1273 },
 1101: { 776:1261 },
 1110: { 776:1111 },
 1140: { 783:1142 },
 1141: { 783:1143 },
 1240: { 776:1242 },
 1241: { 776:1243 },
 1256: { 776:1258 },
 1257: { 776:1259 },
 1488: { 1463:64302, 1464:64303, 1468:64304 },
 1489: { 1468:64305, 1471:64332 },
 1490: { 1468:64306 },
 1491: { 1468:64307 },
 1492: { 1468:64308 },
 1493: { 1465:64331, 1468:64309 },
 1494: { 1468:64310 },
 1496: { 1468:64312 },
 1497: { 1460:64285, 1468:64313 },
 1498: { 1468:64314 },
 1499: { 1468:64315, 1471:64333 },
 1500: { 1468:64316 },
 1502: { 1468:64318 },
 1504: { 1468:64320 },
 1505: { 1468:64321 },
 1507: { 1468:64323 },
 1508: { 1468:64324, 1471:64334 },
 1510: { 1468:64326 },
 1511: { 1468:64327 },
 1512: { 1468:64328 },
 1513: { 1468:64329, 1473:64298, 1474:64299 },
 1514: { 1468:64330 },
 1522: { 1463:64287 },
 1575: { 1619:1570, 1620:1571, 1621:1573 },
 1608: { 1620:1572 },
 1610: { 1620:1574 },
 1729: { 1620:1730 },
 1746: { 1620:1747 },
 1749: { 1620:1728 },
 2325: { 2364:2392 },
 2326: { 2364:2393 },
 2327: { 2364:2394 },
 2332: { 2364:2395 },
 2337: { 2364:2396 },
 2338: { 2364:2397 },
 2344: { 2364:2345 },
 2347: { 2364:2398 },
 2351: { 2364:2399 },
 2352: { 2364:2353 },
 2355: { 2364:2356 },
 2465: { 2492:2524 },
 2466: { 2492:2525 },
 2479: { 2492:2527 },
 2503: { 2494:2507, 2519:2508 },
 2582: { 2620:2649 },
 2583: { 2620:2650 },
 2588: { 2620:2651 },
 2603: { 2620:2654 },
 2610: { 2620:2611 },
 2616: { 2620:2614 },
 2849: { 2876:2908 },
 2850: { 2876:2909 },
 2887: { 2878:2891, 2902:2888, 2903:2892 },
 2962: { 3031:2964 },
 3014: { 3006:3018, 3031:3020 },
 3015: { 3006:3019 },
 3142: { 3158:3144 },
 3263: { 3285:3264 },
 3270: { 3266:3274, 3285:3271, 3286:3272 },
 3274: { 3285:3275 },
 3398: { 3390:3402, 3415:3404 },
 3399: { 3390:3403 },
 3545: { 3530:3546, 3535:3548, 3551:3550 },
 3548: { 3530:3549 },
 3904: { 4021:3945 },
 3906: { 4023:3907 },
 3916: { 4023:3917 },
 3921: { 4023:3922 },
 3926: { 4023:3927 },
 3931: { 4023:3932 },
 3953: { 3954:3955, 3956:3957, 3968:3969 },
 3984: { 4021:4025 },
 3986: { 4023:3987 },
 3996: { 4023:3997 },
 4001: { 4023:4002 },
 4006: { 4023:4007 },
 4011: { 4023:4012 },
 4018: { 3968:3958 },
 4019: { 3968:3960 },
 4133: { 4142:4134 },
 7734: { 772:7736 },
 7735: { 772:7737 },
 7770: { 772:7772 },
 7771: { 772:7773 },
 7778: { 775:7784 },
 7779: { 775:7785 },
 7840: { 770:7852, 774:7862 },
 7841: { 770:7853, 774:7863 },
 7864: { 770:7878 },
 7865: { 770:7879 },
 7884: { 770:7896 },
 7885: { 770:7897 },
 7936: { 768:7938, 769:7940, 834:7942, 837:8064 },
 7937: { 768:7939, 769:7941, 834:7943, 837:8065 },
 7938: { 837:8066 },
 7939: { 837:8067 },
 7940: { 837:8068 },
 7941: { 837:8069 },
 7942: { 837:8070 },
 7943: { 837:8071 },
 7944: { 768:7946, 769:7948, 834:7950, 837:8072 },
 7945: { 768:7947, 769:7949, 834:7951, 837:8073 },
 7946: { 837:8074 },
 7947: { 837:8075 },
 7948: { 837:8076 },
 7949: { 837:8077 },
 7950: { 837:8078 },
 7951: { 837:8079 },
 7952: { 768:7954, 769:7956 },
 7953: { 768:7955, 769:7957 },
 7960: { 768:7962, 769:7964 },
 7961: { 768:7963, 769:7965 },
 7968: { 768:7970, 769:7972, 834:7974, 837:8080 },
 7969: { 768:7971, 769:7973, 834:7975, 837:8081 },
 7970: { 837:8082 },
 7971: { 837:8083 },
 7972: { 837:8084 },
 7973: { 837:8085 },
 7974: { 837:8086 },
 7975: { 837:8087 },
 7976: { 768:7978, 769:7980, 834:7982, 837:8088 },
 7977: { 768:7979, 769:7981, 834:7983, 837:8089 },
 7978: { 837:8090 },
 7979: { 837:8091 },
 7980: { 837:8092 },
 7981: { 837:8093 },
 7982: { 837:8094 },
 7983: { 837:8095 },
 7984: { 768:7986, 769:7988, 834:7990 },
 7985: { 768:7987, 769:7989, 834:7991 },
 7992: { 768:7994, 769:7996, 834:7998 },
 7993: { 768:7995, 769:7997, 834:7999 },
 8000: { 768:8002, 769:8004 },
 8001: { 768:8003, 769:8005 },
 8008: { 768:8010, 769:8012 },
 8009: { 768:8011, 769:8013 },
 8016: { 768:8018, 769:8020, 834:8022 },
 8017: { 768:8019, 769:8021, 834:8023 },
 8025: { 768:8027, 769:8029, 834:8031 },
 8032: { 768:8034, 769:8036, 834:8038, 837:8096 },
 8033: { 768:8035, 769:8037, 834:8039, 837:8097 },
 8034: { 837:8098 },
 8035: { 837:8099 },
 8036: { 837:8100 },
 8037: { 837:8101 },
 8038: { 837:8102 },
 8039: { 837:8103 },
 8040: { 768:8042, 769:8044, 834:8046, 837:8104 },
 8041: { 768:8043, 769:8045, 834:8047, 837:8105 },
 8042: { 837:8106 },
 8043: { 837:8107 },
 8044: { 837:8108 },
 8045: { 837:8109 },
 8046: { 837:8110 },
 8047: { 837:8111 },
 8048: { 837:8114 },
 8052: { 837:8130 },
 8060: { 837:8178 },
 8118: { 837:8119 },
 8127: { 768:8141, 769:8142, 834:8143 },
 8134: { 837:8135 },
 8182: { 837:8183 },
 8190: { 768:8157, 769:8158, 834:8159 },
 8592: { 824:8602 },
 8594: { 824:8603 },
 8596: { 824:8622 },
 8656: { 824:8653 },
 8658: { 824:8655 },
 8660: { 824:8654 },
 8707: { 824:8708 },
 8712: { 824:8713 },
 8715: { 824:8716 },
 8739: { 824:8740 },
 8741: { 824:8742 },
 8764: { 824:8769 },
 8771: { 824:8772 },
 8773: { 824:8775 },
 8776: { 824:8777 },
 8781: { 824:8813 },
 8801: { 824:8802 },
 8804: { 824:8816 },
 8805: { 824:8817 },
 8818: { 824:8820 },
 8819: { 824:8821 },
 8822: { 824:8824 },
 8823: { 824:8825 },
 8826: { 824:8832 },
 8827: { 824:8833 },
 8828: { 824:8928 },
 8829: { 824:8929 },
 8834: { 824:8836 },
 8835: { 824:8837 },
 8838: { 824:8840 },
 8839: { 824:8841 },
 8849: { 824:8930 },
 8850: { 824:8931 },
 8866: { 824:8876 },
 8872: { 824:8877 },
 8873: { 824:8878 },
 8875: { 824:8879 },
 8882: { 824:8938 },
 8883: { 824:8939 },
 8884: { 824:8940 },
 8885: { 824:8941 },
 10973: { 824:10972 },
 12358: { 12441:12436 },
 12363: { 12441:12364 },
 12365: { 12441:12366 },
 12367: { 12441:12368 },
 12369: { 12441:12370 },
 12371: { 12441:12372 },
 12373: { 12441:12374 },
 12375: { 12441:12376 },
 12377: { 12441:12378 },
 12379: { 12441:12380 },
 12381: { 12441:12382 },
 12383: { 12441:12384 },
 12385: { 12441:12386 },
 12388: { 12441:12389 },
 12390: { 12441:12391 },
 12392: { 12441:12393 },
 12399: { 12441:12400, 12442:12401 },
 12402: { 12441:12403, 12442:12404 },
 12405: { 12441:12406, 12442:12407 },
 12408: { 12441:12409, 12442:12410 },
 12411: { 12441:12412, 12442:12413 },
 12445: { 12441:12446 },
 12454: { 12441:12532 },
 12459: { 12441:12460 },
 12461: { 12441:12462 },
 12463: { 12441:12464 },
 12465: { 12441:12466 },
 12467: { 12441:12468 },
 12469: { 12441:12470 },
 12471: { 12441:12472 },
 12473: { 12441:12474 },
 12475: { 12441:12476 },
 12477: { 12441:12478 },
 12479: { 12441:12480 },
 12481: { 12441:12482 },
 12484: { 12441:12485 },
 12486: { 12441:12487 },
 12488: { 12441:12489 },
 12495: { 12441:12496, 12442:12497 },
 12498: { 12441:12499, 12442:12500 },
 12501: { 12441:12502, 12442:12503 },
 12504: { 12441:12505, 12442:12506 },
 12507: { 12441:12508, 12442:12509 },
 12527: { 12441:12535 },
 12528: { 12441:12536 },
 12529: { 12441:12537 },
 12530: { 12441:12538 },
 12541: { 12441:12542 },
 64329: { 1473:64300, 1474:64301 },
 119127: { 119141:119134 },
 119128: { 119141:119135 },
 119135: { 119150:119136, 119151:119137, 119152:119138, 119153:119139, 119154:119140 },
 119225: { 119141:119227 },
 119226: { 119141:119228 },
 119227: { 119150:119229, 119151:119231 },
 119228: { 119150:119230, 119151:119232 }
};
/* End of tables generated by casemap.py. */


/* Convert a 32-bit Unicode value to a JS string. */
function CharToString(val) {
    if (val < 0x10000) {
        return String.fromCharCode(val);
    }
    else {
        val -= 0x10000;
        return String.fromCharCode(0xD800 + (val >> 10), 0xDC00 + (val & 0x3FF));
    }
}

/* Given an array, return an array of the same length with all the values
   trimmed to the range 0-255. This may be the same array. */
function TrimArrayToBytes(arr) {
    var ix, newarr;
    var len = arr.length;
    for (ix=0; ix<len; ix++) {
        if (arr[ix] < 0 || arr[ix] >= 0x100) 
            break;
    }
    if (ix == len) {
        return arr;
    }
    newarr = Array(len);
    for (ix=0; ix<len; ix++) {
        if (arr[ix] < 0 || arr[ix] >= 0x100) 
            newarr[ix] = 63;  // '?'
        else
            newarr[ix] = arr[ix];
    }
    return newarr;
}

/* Convert an array of 8-bit values to a JS string, trimming if
   necessary. */
function ByteArrayToString(arr) {
    var ix, newarr;
    var len = arr.length;
    if (len == 0)
        return '';
    for (ix=0; ix<len; ix++) {
        if (arr[ix] < 0 || arr[ix] >= 0x100) 
            break;
    }
    if (ix == len) {
        return String.fromCharCode.apply(this, arr);
    }
    newarr = Array(len);
    for (ix=0; ix<len; ix++) {
        newarr[ix] = String.fromCharCode(arr[ix] & 0xFF);
    }
    return newarr.join('');
}

/* Convert an array of 32-bit Unicode values to a JS string. If they're
   all in the 16-bit range, this is easy; otherwise we have to do
   some munging. */
function UniArrayToString(arr) {
    var ix, val, newarr;
    var len = arr.length;
    if (len == 0)
        return '';
    for (ix=0; ix<len; ix++) {
        if (arr[ix] >= 0x10000) 
            break;
    }
    if (ix == len) {
        return String.fromCharCode.apply(this, arr);
    }
    newarr = Array(len);
    for (ix=0; ix<len; ix++) {
        val = arr[ix];
        if (val < 0x10000) {
            newarr[ix] = String.fromCharCode(val);
        }
        else {
            val -= 0x10000;
            newarr[ix] = String.fromCharCode(0xD800 + (val >> 10), 0xDC00 + (val & 0x3FF));
        }
    }
    return newarr.join('');
}

/* Convert an array of 32-bit Unicode values to an array of 8-bit byte
   values, encoded UTF-8. If all the values are 0-127, this returns the
   same array. Otherwise it returns a new (longer) array. */
function UniArrayToUTF8(arr) {
    var count = 0;

    for (var ix=0; ix<arr.length; ix++) {
        var val = arr[ix];
        if (val < 0x80) {
            count += 1;
        }
        else if (val < 0x800) {
            count += 2;
        }
        else if (val < 0x10000) {
            count += 3;
        }
        else if (val < 0x200000) {
            count += 4;
        }
        else {
            count += 1;
        }
    }

    if (count == arr.length)
        return arr;

    var res = [];
    for (var ix=0; ix<arr.length; ix++) {
        var val = arr[ix];
        if (val < 0x80) {
            res.push(val);
        }
        else if (val < 0x800) {
            res.push(0xC0 | ((val & 0x7C0) >> 6));
            res.push(0x80 |  (val & 0x03F)     );
        }
        else if (val < 0x10000) {
            res.push(0xE0 | ((val & 0xF000) >> 12));
            res.push(0x80 | ((val & 0x0FC0) >>  6));
            res.push(0x80 |  (val & 0x003F)      );
        }
        else if (val < 0x200000) {
            res.push(0xF0 | ((val & 0x1C0000) >> 18));
            res.push(0x80 | ((val & 0x03F000) >> 12));
            res.push(0x80 | ((val & 0x000FC0) >>  6));
            res.push(0x80 |  (val & 0x00003F)      );
        }
        else {
            res.push(63);  // '?'
        }
    }

    return res;
}

/* Convert an array of 32-bit Unicode values to an array of 8-bit byte
   values, encoded as big-endian words. */
function UniArrayToBE32(arr) {
    var res = new Array(4*arr.length);
    for (var ix=0; ix<arr.length; ix++) {
        var val = arr[ix];
        res[4*ix]   = (val >> 24) & 0xFF;
        res[4*ix+1] = (val >> 16) & 0xFF;
        res[4*ix+2] = (val >> 8) & 0xFF;
        res[4*ix+3] = (val) & 0xFF;
    }
    return res;
}

/* Log the message in the browser's error log, if it has one. (This shows
   up in Safari, in Opera, and in Firefox if you have Firebug installed.)
*/
function qlog(msg) {
    if (window.console && console.log)
        console.log(msg);
    else if (window.opera && opera.postError)
        opera.postError(msg);
}

/* RefBox: Simple class used for "call-by-reference" Glk arguments. The object
   is just a box containing a single value, which can be written and read.
*/
function RefBox() {
    this.value = undefined;
    this.set_value = function(val) {
        this.value = val;
    }
    this.get_value = function() {
        return this.value;
    }
}

/* RefStruct: Used for struct-type Glk arguments. After creating the
   object, you should call push_field() the appropriate number of times,
   to set the initial field values. Then set_field() can be used to
   change them, and get_fields() retrieves the list of all fields.

   (The usage here is loose, since Javascript is forgiving about arrays.
   Really the caller could call set_field() instead of push_field() --
   or skip that step entirely, as long as the Glk function later calls
   set_field() for each field. Which it should.)
*/
function RefStruct(numels) {
    this.fields = [];
    this.push_field = function(val) {
        this.fields.push(val);
    }
    this.set_field = function(pos, val) {
        this.fields[pos] = val;
    }
    this.get_field = function(pos) {
        return this.fields[pos];
    }
    this.get_fields = function() {
        return this.fields;
    }
}

/* Dummy return value, which means that the Glk call is still in progress,
   or will never return at all. This is used by glk_exit(), glk_select(),
   and glk_fileref_create_by_prompt().
*/
var DidNotReturn = { dummy: 'Glk call has not yet returned' };

/* This returns a hint for whether the Glk call (by selector number)
   might block or never return. True for glk_exit(), glk_select(),
   and glk_fileref_create_by_prompt().
*/
function call_may_not_return(id) {
    if (id == 0x001 || id == 0x0C0 || id == 0x062)
        return true;
    else
        return false;
}

var strtype_File = 1;
var strtype_Window = 2;
var strtype_Memory = 3;
var strtype_Resource = 4;

/* Extra update information -- autorestore only. */
var gli_autorestore_glkstate = null;

/* Beginning of linked list of windows. */
var gli_windowlist = null;
var gli_rootwin = null;
/* Set when any window is created, destroyed, or resized. */
var geometry_changed = true; 
/* Received from GlkOte; describes the window size. */
var content_metrics = null;

/* Beginning of linked list of streams. */
var gli_streamlist = null;
/* Beginning of linked list of filerefs. */
var gli_filereflist = null;
/* Beginning of linked list of schannels. */
var gli_schannellist = null;

/* The current output stream. */
var gli_currentstr = null;

/* During a glk_select() block, this is the RefStruct which will contain
   the result. */
var gli_selectref = null;

/* This is used to assigned disprock values to windows, when there is
   no GiDispa layer to provide them. */
var gli_api_display_rocks = 1;

/* A positive number if the timer is set. */
var gli_timer_interval = null; 
var gli_timer_started = null; /* when the setTimeout began */
var gli_timer_lastsent = null; /* last interval sent to GlkOte */

function gli_new_window(type, rock) {
    var win = {};
    win.type = type;
    win.rock = rock;
    win.disprock = undefined;

    win.parent = null;
    win.str = gli_stream_open_window(win);
    win.echostr = null;
    win.style = Const.style_Normal;
    win.hyperlink = 0;

    win.input_generation = null;
    win.linebuf = null;
    win.char_request = false;
    win.line_request = false;
    win.char_request_uni = false;
    win.line_request_uni = false;
    win.hyperlink_request = false;
    win.mouse_request = false;
    win.echo_line_input = true;
    win.line_input_terminators = [];
    win.request_echo_line_input = null; /* only used during a request */

    /* window-type-specific info is set up in glk_window_open */

    win.prev = null;
    win.next = gli_windowlist;
    gli_windowlist = win;
    if (win.next)
        win.next.prev = win;

    if (GiDispa)
        GiDispa.class_register('window', win);
    else
        win.disprock = gli_api_display_rocks++;
    /* We need to assign a disprock even if there's no GiDispa layer,
       because GlkOte differentiates windows by their disprock. */
    geometry_changed = true;

    return win;
}

function gli_delete_window(win) {
    var prev, next;

    if (GiDispa)
        GiDispa.class_unregister('window', win);
    geometry_changed = true;
    
    win.echostr = null;
    if (win.str) {
        gli_delete_stream(win.str);
        win.str = null;
    }

    prev = win.prev;
    next = win.next;
    win.prev = null;
    win.next = null;

    if (prev)
        prev.next = next;
    else
        gli_windowlist = next;
    if (next)
        next.prev = prev;

    win.parent = null;
    win.rock = null;
    win.disprock = null;
}

function gli_windows_unechostream(str) {
    var win;
    
    for (win=gli_windowlist; win; win=win.next) {
        if (win.echostr === str)
            win.echostr = null;
    }
}

/* Add a (Javascript) string to the given window's display. */
function gli_window_put_string(win, val) {
    var ix, ch;

    //### might be efficient to split the implementation up into
    //### gli_window_buffer_put_string(), etc, since many functions
    //### know the window type when they call this
    switch (win.type) {
    case Const.wintype_TextBuffer:
        if (win.style != win.accumstyle
            || win.hyperlink != win.accumhyperlink)
            gli_window_buffer_deaccumulate(win);
        win.accum.push(val);
        break;
    case Const.wintype_TextGrid:
        for (ix=0; ix<val.length; ix++) {
            ch = val.charAt(ix);

            /* Canonicalize the cursor position. This is like calling
               gli_window_grid_canonicalize(), but I've inlined it. */
            if (win.cursorx < 0)
                win.cursorx = 0;
            if (win.cursorx >= win.gridwidth) {
                win.cursorx = 0;
                win.cursory++;
            }
            if (win.cursory < 0)
                win.cursory = 0;
            if (win.cursory >= win.gridheight)
                break; /* outside the window */

            if (ch == "\n") {
                /* a newline just moves the cursor. */
                win.cursory++;
                win.cursorx = 0;
                continue;
            }

            var lineobj = win.lines[win.cursory];
            lineobj.dirty = true;
            lineobj.chars[win.cursorx] = ch;
            lineobj.styles[win.cursorx] = win.style;
            lineobj.hyperlinks[win.cursorx] = win.hyperlink;

            win.cursorx++;
            /* We can leave the cursor outside the window, since it will be
               canonicalized next time a character is printed. */
        }
        break;
    }
}

/* Canonicalize the cursor position. That is, the cursor may have
   been left outside the window area; wrap it if necessary.

   Returns true if the cursor winds up wrapped outside the window entirely;
   false if the cursor winds up at a legal printing position.
*/
function gli_window_grid_canonicalize(win) {
    if (win.cursorx < 0)
        win.cursorx = 0;
    if (win.cursorx >= win.gridwidth) {
        win.cursorx = 0;
        win.cursory++;
    }
    if (win.cursory < 0)
        win.cursory = 0;
    if (win.cursory >= win.gridheight)
        return true; /* outside the window */
    return false;
}

/* Take the accumulation of strings (since the last style change) and
   assemble them into a buffer window update. This must be called
   after each style change; it must also be called right before 
   GlkOte.update(). (Actually we call it right before win.accum.push
   if the style has changed -- there's no need to call for *every* style
   change if no text is being pushed out in between.)
*/
function gli_window_buffer_deaccumulate(win) {
    var conta = win.content;
    var stylename = StyleNameMap[win.accumstyle];
    var text, ls, ix, obj, arr;

    if (win.accum.length) {
        text = win.accum.join('');
        ls = text.split('\n');
        for (ix=0; ix<ls.length; ix++) {
            arr = undefined;
            if (ix == 0) {
                if (ls[ix]) {
                    if (conta.length == 0) {
                        arr = [];
                        conta.push({ content: arr, append: true });
                    }
                    else {
                        obj = conta[conta.length-1];
                        if (!obj.content) {
                            arr = [];
                            obj.content = arr;
                        }
                        else {
                            arr = obj.content;
                        }
                    }
                }
            }
            else {
                if (ls[ix]) {
                    arr = [];
                    conta.push({ content: arr });
                }
                else {
                    conta.push({ });
                }
            }
            if (arr !== undefined) {
                if (!win.accumhyperlink) {
                    arr.push(stylename);
                    arr.push(ls[ix]);
                }
                else {
                    arr.push({ style:stylename, text:ls[ix], hyperlink:win.accumhyperlink });
                }
            }
        }
    }

    win.accum.length = 0;
    win.accumstyle = win.style;
    win.accumhyperlink = win.hyperlink;
}

/* Add a special object onto a buffer window update. This resets the
   accumulator.
*/
function gli_window_buffer_put_special(win, special, flowbreak) {
    gli_window_buffer_deaccumulate(win);

    var conta = win.content;
    var arr = undefined;
    var obj;

    /* The next bit is a simplified version of the array-append code 
       from deaccumulate(). It's simpler because we have exactly one
       item to add. */

    if (conta.length == 0) {
        arr = [];
        obj = { content: arr, append: true };
        if (flowbreak)
            obj.flowbreak = true;
        conta.push(obj);
    }
    else {
        obj = conta[conta.length-1];
        if (flowbreak)
            obj.flowbreak = true;
        if (!obj.content) {
            arr = [];
            obj.content = arr;
        }
        else {
            arr = obj.content;
        }
    }
    
    if (arr !== undefined && special !== undefined) {
        arr.push(special);
    }
}

function gli_window_close(win, recurse) {
    var wx;
    
    for (wx=win.parent; wx; wx=wx.parent) {
        if (wx.type == Const.wintype_Pair) {
            if (wx.pair_key === win) {
                wx.pair_key = null;
                wx.pair_keydamage = true;
            }
        }
    }

    if (GiDispa && win.linebuf) {
        GiDispa.unretain_array(win.linebuf);
        win.linebuf = null;
    }
    
    switch (win.type) {
        case Const.wintype_Pair: 
            if (recurse) {
                if (win.child1)
                    gli_window_close(win.child1, true);
                if (win.child2)
                    gli_window_close(win.child2, true);
            }
            win.child1 = null;
            win.child2 = null;
            win.pair_key = null;
            break;
        case Const.wintype_TextBuffer: 
            win.accum = null;
            win.content = null;
            win.reserve = null;
            break;
        case Const.wintype_TextGrid: 
            win.lines = null;
            break;
        case Const.wintype_Graphics:
            win.content = null;
            win.reserve = null;
            break;
    }
    
    gli_delete_window(win);
}

function gli_window_rearrange(win, box) {
    var width, height, oldwidth, oldheight;
    var min, max, diff, split, splitwid, ix, cx, lineobj;
    var box1, box2, ch1, ch2;

    geometry_changed = true;
    win.bbox = box;

    switch (win.type) {

    case Const.wintype_TextGrid:
        /* Compute the new grid size. */
        width = box.right - box.left;
        height = box.bottom - box.top;
        oldheight = win.gridheight;
        win.gridwidth = Math.max(0, Math.floor((width-content_metrics.gridmarginx) / content_metrics.gridcharwidth));
        win.gridheight = Math.max(0, Math.floor((height-content_metrics.gridmarginy) / content_metrics.gridcharheight));

        /* Now we have to resize the win.lines array, in two dimensions. */
        if (oldheight > win.gridheight) {
            win.lines.length = win.gridheight;
        }
        else if (oldheight < win.gridheight) {
            for (ix=oldheight; ix<win.gridheight; ix++) {
                win.lines[ix] = { chars:[], styles:[], hyperlinks:[], 
                                  dirty:true };
            }
        }
        for (ix=0; ix<win.gridheight; ix++) {
            lineobj = win.lines[ix];
            oldwidth = lineobj.chars.length;
            if (oldwidth > win.gridwidth) {
                lineobj.dirty = true;
                lineobj.chars.length = win.gridwidth;
                lineobj.styles.length = win.gridwidth;
                lineobj.hyperlinks.length = win.gridwidth;
            }
            else if (oldwidth < win.gridwidth) {
                lineobj.dirty = true;
                for (cx=oldwidth; cx<win.gridwidth; cx++) {
                    lineobj.chars[cx] = ' ';
                    lineobj.styles[cx] = Const.style_Normal;
                    lineobj.hyperlinks[cx] = 0;
                }
            }
        }
        break;

    case Const.wintype_Graphics:
        /* Compute the new canvas size. */
        width = box.right - box.left;
        height = box.bottom - box.top;
        win.graphwidth = Math.max(0, width - content_metrics.graphicsmarginx);
        win.graphheight = Math.max(0, height - content_metrics.graphicsmarginy);
        break;

    case Const.wintype_Pair:
        if (win.pair_vertical) {
            min = win.bbox.left;
            max = win.bbox.right;
            splitwid = content_metrics.inspacingx;
        }
        else {
            min = win.bbox.top;
            max = win.bbox.bottom;
            splitwid = content_metrics.inspacingy;
        }
        if (!win.pair_hasborder)
            splitwid = 0;
        diff = max - min;

        if (win.pair_division == Const.winmethod_Proportional) {
            split = Math.floor((diff * win.pair_size) / 100);
        }
        else if (win.pair_division == Const.winmethod_Fixed) {
            split = 0;
            if (win.pair_key && win.pair_key.type == Const.wintype_TextBuffer) {
                if (!win.pair_vertical) 
                    split = (win.pair_size * content_metrics.buffercharheight + content_metrics.buffermarginy);
                else
                    split = (win.pair_size * content_metrics.buffercharwidth + content_metrics.buffermarginx);
            }
            if (win.pair_key && win.pair_key.type == Const.wintype_TextGrid) {
                if (!win.pair_vertical) 
                    split = (win.pair_size * content_metrics.gridcharheight + content_metrics.gridmarginy);
                else
                    split = (win.pair_size * content_metrics.gridcharwidth + content_metrics.gridmarginx);
            }
            if (win.pair_key && win.pair_key.type == Const.wintype_Graphics) {
                if (!win.pair_vertical) 
                    split = win.pair_size + content_metrics.graphicsmarginy;
                else
                    split = win.pair_size + content_metrics.graphicsmarginx;
            }
            split = Math.ceil(split);
        }
        else {
            /* default behavior for unknown division method */
            split = Math.floor(diff / 2);
        }

        /* Split is now a number between 0 and diff. Convert that to a number
           between min and max; also apply upside-down-ness. */
        if (!win.pair_backward) {
            split = max-split-splitwid;
        }
        else {
            split = min+split;
        }

        /* Make sure it's really between min and max. */
        if (min >= max) {
            split = min;
        }
        else {
            split = Math.min(Math.max(split, min), max-splitwid);
        }

        win.pair_splitpos = split;
        win.pair_splitwidth = splitwid;
        if (win.pair_vertical) {
            box1 = {
                left: win.bbox.left,
                right: win.pair_splitpos,
                top: win.bbox.top,
                bottom: win.bbox.bottom
            };
            box2 = {
                left: box1.right + win.pair_splitwidth,
                right: win.bbox.right,
                top: win.bbox.top,
                bottom: win.bbox.bottom
            };
        }
        else {
            box1 = {
                top: win.bbox.top,
                bottom: win.pair_splitpos,
                left: win.bbox.left,
                right: win.bbox.right
            };
            box2 = {
                top: box1.bottom + win.pair_splitwidth,
                bottom: win.bbox.bottom,
                left: win.bbox.left,
                right: win.bbox.right
            };
        }
        if (!win.pair_backward) {
            ch1 = win.child1;
            ch2 = win.child2;
        }
        else {
            ch1 = win.child2;
            ch2 = win.child1;
        }

        gli_window_rearrange(ch1, box1);
        gli_window_rearrange(ch2, box2);
        break;

    }
}

function gli_new_stream(type, readable, writable, rock) {
    var str = {};
    str.type = type;
    str.rock = rock;
    str.disprock = undefined;

    str.unicode = false;
    /* isbinary is only meaningful for Resource and streaming-File streams */
    str.isbinary = false;
    str.streaming = false;
    str.ref = null;
    str.win = null;
    str.file = null;

    /* for buffer mode */
    str.buf = null;
    str.bufpos = 0;
    str.buflen = 0;
    str.bufeof = 0;
    str.timer_id = null;
    str.flush_func = null;

    /* for streaming mode */
    str.fstream = null;

    str.readcount = 0;
    str.writecount = 0;
    str.readable = readable;
    str.writable = writable;

    str.prev = null;
    str.next = gli_streamlist;
    gli_streamlist = str;
    if (str.next)
        str.next.prev = str;

    if (GiDispa)
        GiDispa.class_register('stream', str);

    return str;
}

function gli_delete_stream(str) {
    var prev, next;
    
    if (str === gli_currentstr) {
        gli_currentstr = null;
    }

    gli_windows_unechostream(str);

    if (str.type == strtype_Memory) {
        if (GiDispa)
            GiDispa.unretain_array(str.buf);
    }
    else if (str.type == strtype_File) {
        if (str.fstream) {
            str.fstream.fclose();
            str.fstream = null;
        }
    }

    if (GiDispa)
        GiDispa.class_unregister('stream', str);

    prev = str.prev;
    next = str.next;
    str.prev = null;
    str.next = null;

    if (prev)
        prev.next = next;
    else
        gli_streamlist = next;
    if (next)
        next.prev = prev;

    str.fstream = null;
    str.buf = null;
    str.readable = false;
    str.writable = false;
    str.ref = null;
    str.win = null;
    str.file = null;
    str.rock = null;
    str.disprock = null;
}

function gli_stream_open_window(win) {
    var str;
    str = gli_new_stream(strtype_Window, false, true, 0);
    str.unicode = true;
    str.win = win;
    return str;
}

/* This is called on every write to a file stream. If a file is being
   written intermittently (a transcript file, for example) we'd like to
   flush the output every few seconds, in case the user closes the
   browser without closing the file ("script off").

   We do this by setting a ten-second timer (if there isn't one set already).
   The timer calls a flush method on the stream.

   (If autosave is on, we'll wind up flushing on most glk_select calls,
   which isn't quite as nicely paced. But it's a minor problem.)
*/
function gli_stream_dirty_file(str) {
    if (str.streaming)
        GlkOte.log('Bug: gli_stream_dirty_file called for streaming file!');
    if (str.timer_id === null) {
        if (str.flush_func === null) {
            /* Bodge together a closure to act as a stream method. */
            str.flush_func = function() { gli_stream_flush_file(str); };
        }
        str.timer_id = setTimeout(str.flush_func, 10000);
    }
}

/* Write out the contents of a file stream to the "disk file". Because
   localStorage doesn't support appending, we have to dump the entire
   buffer out.
*/
function gli_stream_flush_file(str) {
    var Dialog = GlkOte.getlibrary('Dialog');
    
    if (str.streaming)
        GlkOte.log('Bug: gli_stream_flush_file called for streaming file!');
    if (!(str.timer_id === null)) {
        clearTimeout(str.timer_id);
    }
    str.timer_id = null;
    Dialog.file_write(str.ref, str.buf);
}

function gli_new_fileref(filename, usage, rock, ref) {
    var Dialog = GlkOte.getlibrary('Dialog');
    
    var fref = {};
    fref.filename = filename;
    fref.rock = rock;
    fref.disprock = undefined;

    fref.textmode = ((usage & Const.fileusage_TextMode) != 0);
    fref.filetype = (usage & Const.fileusage_TypeMask);
    fref.filetypename = FileTypeMap[fref.filetype];
    if (!fref.filetypename) {
        fref.filetypename = 'xxx';
    }

    if (!ref) {
        var gameid = '';
        if (fref.filetype == Const.fileusage_SavedGame)
            gameid = VM.get_signature();
        ref = Dialog.file_construct_ref(fref.filename, fref.filetypename, gameid);
    }
    fref.ref = ref;

    fref.prev = null;
    fref.next = gli_filereflist;
    gli_filereflist = fref;
    if (fref.next)
        fref.next.prev = fref;

    if (GiDispa)
        GiDispa.class_register('fileref', fref);

    return fref;
}

function gli_delete_fileref(fref) {
    var prev, next;
    
    if (GiDispa)
        GiDispa.class_unregister('fileref', fref);

    prev = fref.prev;
    next = fref.next;
    fref.prev = null;
    fref.next = null;

    if (prev)
        prev.next = next;
    else
        gli_filereflist = next;
    if (next)
        next.prev = prev;

    fref.filename = null;
    fref.ref = null;
    fref.rock = null;
    fref.disprock = null;
}

/* Write one character (given as a Unicode value) to a stream.
   This is called by both the one-byte and four-byte character APIs.
*/
function gli_put_char(str, ch) {
    if (!str || !str.writable)
        throw('gli_put_char: invalid stream');

    if (!str.unicode) {
        if (ch < 0 || ch >= 0x100)
            ch = 63;  // '?'
    }

    str.writecount += 1;
    
    switch (str.type) {
    case strtype_File:
        if (str.streaming) {
            if (!str.unicode) {
                str.buffer4[0] = ch;
                str.fstream.fwrite(str.buffer4, 1);
            }
            else {
                if (!str.isbinary) {
                    /* cheap UTF-8 stream */
                    var len;
                    if (ch < 0x10000) {
                        len = str.buffer4.write(String.fromCharCode(ch));
                        str.fstream.fwrite(str.buffer4, len); // utf8
                    }
                    else {
                        /* String.fromCharCode chokes on astral characters;
                           do it the hard way */
                        var arr8 = UniArrayToUTF8([ch]);
                        var buf = str.fstream.BufferClass.from(arr8);
                        str.fstream.fwrite(buf);
                    }
                }
                else {
                    /* cheap big-endian stream */
                    str.buffer4.writeUInt32BE(ch, 0, true);
                    str.fstream.fwrite(str.buffer4, 4);
                }
            }
        }
        else {
            /* non-streaming... */
            gli_stream_dirty_file(str);
            if (!str.unicode || (ch < 0x80 && !str.isbinary)) {
                if (str.bufpos < str.buflen) {
                    str.buf[str.bufpos] = ch;
                    str.bufpos += 1;
                    if (str.bufpos > str.bufeof)
                        str.bufeof = str.bufpos;
                }
            }
            else {
                var arr;
                if (!str.isbinary)
                    arr = UniArrayToUTF8([ch]);
                else
                    arr = UniArrayToBE32([ch]);
                var len = arr.length;
                if (len > str.buflen-str.bufpos)
                    len = str.buflen-str.bufpos;
                for (var ix=0; ix<len; ix++)
                    str.buf[str.bufpos+ix] = arr[ix];
                str.bufpos += len;
                if (str.bufpos > str.bufeof)
                    str.bufeof = str.bufpos;
            }
        }
        break;
    case strtype_Memory:
        if (str.bufpos < str.buflen) {
            str.buf[str.bufpos] = ch;
            str.bufpos += 1;
            if (str.bufpos > str.bufeof)
                str.bufeof = str.bufpos;
        }
        break;
    case strtype_Window:
        if (str.win.line_request)
            throw('gli_put_char: window has pending line request');
        gli_window_put_string(str.win, CharToString(ch));
        if (str.win.echostr)
            gli_put_char(str.win.echostr, ch);
        break;
    }
}

/* Write characters (given as an array of Unicode values) to a stream.
   This is called by both the one-byte and four-byte character APIs.
   The "allbytes" argument is a hint that all the array values are
   already in the range 0-255.
*/
function gli_put_array(str, arr, allbytes) {
    var ix, len, val;

    if (!str || !str.writable)
        throw('gli_put_array: invalid stream');

    if (!str.unicode && !allbytes) {
        arr = TrimArrayToBytes(arr);
        allbytes = true;
    }

    str.writecount += arr.length;
    
    switch (str.type) {
    case strtype_File:
        if (str.streaming) {
            if (!str.unicode) {
                var buf = str.fstream.BufferClass.from(arr);
                str.fstream.fwrite(buf);
            }
            else {
                if (!str.isbinary) {
                    /* cheap UTF-8 stream */
                    var arr8 = UniArrayToUTF8(arr);
                    var buf = str.fstream.BufferClass.from(arr8);
                    str.fstream.fwrite(buf);
                }
                else {
                    /* cheap big-endian stream */
                    var buf = str.fstream.BufferClass.alloc(4*arr.length);
                    for (ix=0; ix<arr.length; ix++) {
                        buf.writeUInt32BE(arr[ix], 4*ix, true);
                    }
                    str.fstream.fwrite(buf);
                }
            }
        }
        else {
            /* non-streaming... */
            gli_stream_dirty_file(str);
            var arr8;
            if (!str.unicode) {
                arr8 = arr;
            }
            else {
                if (!str.isbinary)
                    arr8 = UniArrayToUTF8(arr);
                else
                    arr8 = UniArrayToBE32(arr);
            }
            var len = arr8.length;
            if (len > str.buflen-str.bufpos)
                len = str.buflen-str.bufpos;
            for (ix=0; ix<len; ix++)
                str.buf[str.bufpos+ix] = arr8[ix];
            str.bufpos += len;
            if (str.bufpos > str.bufeof)
                str.bufeof = str.bufpos;
        }
        break;
    case strtype_Memory:
        len = arr.length;
        if (len > str.buflen-str.bufpos)
            len = str.buflen-str.bufpos;
        for (ix=0; ix<len; ix++)
            str.buf[str.bufpos+ix] = arr[ix];
        str.bufpos += len;
        if (str.bufpos > str.bufeof)
            str.bufeof = str.bufpos;
        break;
    case strtype_Window:
        if (str.win.line_request)
            throw('gli_put_array: window has pending line request');
        if (allbytes)
            val = String.fromCharCode.apply(this, arr);
        else
            val = UniArrayToString(arr);
        gli_window_put_string(str.win, val);
        if (str.win.echostr)
            gli_put_array(str.win.echostr, arr, allbytes);
        break;
    }
}

function gli_get_char(str, want_unicode) {
    var ch;

    if (!str || !str.readable)
        return -1;
    
    switch (str.type) {
    case strtype_File:
        if (str.streaming) {
            if (!str.unicode) {
                var len = str.fstream.fread(str.buffer4, 1);
                if (!len)
                    return -1;
                str.readcount++;
                return str.buffer4[0];
            }
            else {
                if (!str.isbinary) {
                    /* slightly less cheap UTF8 stream */
                    var val0, val1, val2, val3;
                    var len = str.fstream.fread(str.buffer4, 1);
                    if (!len)
                        return -1;
                    val0 = str.buffer4[0];
                    if (val0 < 0x80) {
                        ch = val0;
                    }
                    else {
                        var len = str.fstream.fread(str.buffer4, 1);
                        if (!len)
                            return -1;
                        val1 = str.buffer4[0];
                        if ((val1 & 0xC0) != 0x80)
                            return -1;
                        if ((val0 & 0xE0) == 0xC0) {
                            ch = (val0 & 0x1F) << 6;
                            ch |= (val1 & 0x3F);
                        }
                        else {
                            var len = str.fstream.fread(str.buffer4, 1);
                            if (!len)
                                return -1;
                            val2 = str.buffer4[0];
                            if ((val2 & 0xC0) != 0x80)
                                return -1;
                            if ((val0 & 0xF0) == 0xE0) {
                                ch = (((val0 & 0xF)<<12)  & 0x0000F000);
                                ch |= (((val1 & 0x3F)<<6) & 0x00000FC0);
                                ch |= (((val2 & 0x3F))    & 0x0000003F);
                            }
                            else if ((val0 & 0xF0) == 0xF0) {
                                var len = str.fstream.fread(str.buffer4, 1);
                                if (!len)
                                    return -1;
                                val3 = str.buffer4[0];
                                if ((val3 & 0xC0) != 0x80)
                                    return -1;
                                ch = (((val0 & 0x7)<<18)   & 0x1C0000);
                                ch |= (((val1 & 0x3F)<<12) & 0x03F000);
                                ch |= (((val2 & 0x3F)<<6)  & 0x000FC0);
                                ch |= (((val3 & 0x3F))     & 0x00003F);
                            }
                            else {
                                return -1;
                            }
                        }
                    }
                }
                else {
                    /* cheap big-endian stream */
                    var len = str.fstream.fread(str.buffer4, 4);
                    if (len < 4)
                        return -1;
                    /*### or buf.readUInt32BE(0, true) */
                    ch = (str.buffer4[0] << 24);
                    ch |= (str.buffer4[1] << 16);
                    ch |= (str.buffer4[2] << 8);
                    ch |= str.buffer4[3];
                }
                str.readcount++;
                ch >>>= 0;
                if (!want_unicode && ch >= 0x100)
                    return 63; // return '?'
                return ch;
            }
        }
        /* non-streaming, fall through to resource... */
    case strtype_Resource:
        if (str.unicode) {
            if (str.isbinary) {
                /* cheap big-endian stream */
                if (str.bufpos >= str.bufeof)
                    return -1;
                ch = str.buf[str.bufpos];
                str.bufpos++;
                if (str.bufpos >= str.bufeof)
                    return -1;
                ch = (ch << 8) | (str.buf[str.bufpos] & 0xFF);
                str.bufpos++;
                if (str.bufpos >= str.bufeof)
                    return -1;
                ch = (ch << 8) | (str.buf[str.bufpos] & 0xFF);
                str.bufpos++;
                if (str.bufpos >= str.bufeof)
                    return -1;
                ch = (ch << 8) | (str.buf[str.bufpos] & 0xFF);
                str.bufpos++;
            }
            else {
                /* slightly less cheap UTF8 stream */
                var val0, val1, val2, val3;
                if (str.bufpos >= str.bufeof)
                    return -1;
                val0 = str.buf[str.bufpos];
                str.bufpos++;
                if (val0 < 0x80) {
                    ch = val0;
                }
                else {
                    if (str.bufpos >= str.bufeof)
                        return -1;
                    val1 = str.buf[str.bufpos];
                    str.bufpos++;
                    if ((val1 & 0xC0) != 0x80)
                        return -1;
                    if ((val0 & 0xE0) == 0xC0) {
                        ch = (val0 & 0x1F) << 6;
                        ch |= (val1 & 0x3F);
                    }
                    else {
                        if (str.bufpos >= str.bufeof)
                            return -1;
                        val2 = str.buf[str.bufpos];
                        str.bufpos++;
                        if ((val2 & 0xC0) != 0x80)
                            return -1;
                        if ((val0 & 0xF0) == 0xE0) {
                            ch = (((val0 & 0xF)<<12)  & 0x0000F000);
                            ch |= (((val1 & 0x3F)<<6) & 0x00000FC0);
                            ch |= (((val2 & 0x3F))    & 0x0000003F);
                        }
                        else if ((val0 & 0xF0) == 0xF0) {
                            if (str.bufpos >= str.bufeof)
                                return -1;
                            val3 = str.buf[str.bufpos];
                            str.bufpos++;
                            if ((val3 & 0xC0) != 0x80)
                                return -1;
                            ch = (((val0 & 0x7)<<18)   & 0x1C0000);
                            ch |= (((val1 & 0x3F)<<12) & 0x03F000);
                            ch |= (((val2 & 0x3F)<<6)  & 0x000FC0);
                            ch |= (((val3 & 0x3F))     & 0x00003F);
                        }
                        else {
                            return -1;
                        }
                    }
                }
            }
            str.readcount++;
            ch >>>= 0;
            if (!want_unicode && ch >= 0x100)
                return 63; // return '?'
            return ch;
        }
        /* non-unicode file/resource, fall through to memory... */
    case strtype_Memory:
        if (str.bufpos < str.bufeof) {
            ch = str.buf[str.bufpos];
            str.bufpos++;
            str.readcount++;
            if (!want_unicode && ch >= 0x100)
                return 63; // return '?'
            return ch;
        }
        else {
            return -1; // end of stream 
        }
    default:
        return -1;
    }
}

function gli_get_line(str, buf, want_unicode) {
    if (!str || !str.readable)
        return 0;

    var len = buf.length;
    var lx, ch;
    var gotnewline;

    switch (str.type) {
    case strtype_File:
        if (str.streaming) {
            if (len == 0)
                return 0;
            len -= 1; /* for the terminal null */
            gotnewline = false;
            for (lx=0; lx<len && !gotnewline; lx++) {
                ch = gli_get_char(str, want_unicode);
                if (ch == -1)
                    break;
                buf[lx] = ch;
                gotnewline = (ch == 10);
            }
            return lx;
        }
        /* non-streaming, fall through to resource... */
    case strtype_Resource:
        if (str.unicode) {
            if (len == 0)
                return 0;
            len -= 1; /* for the terminal null */
            gotnewline = false;
            for (lx=0; lx<len && !gotnewline; lx++) {
                ch = gli_get_char(str, want_unicode);
                if (ch == -1)
                    break;
                buf[lx] = ch;
                gotnewline = (ch == 10);
            }
            return lx;
        }
        /* non-unicode file/resource, fall through to memory... */
    case strtype_Memory:
        if (len == 0)
            return 0;
        len -= 1; /* for the terminal null */
        if (str.bufpos >= str.bufeof) {
            len = 0;
        }
        else {
            if (str.bufpos + len > str.bufeof) {
                len = str.bufeof - str.bufpos;
            }
        }
        gotnewline = false;
        if (!want_unicode) {
            for (lx=0; lx<len && !gotnewline; lx++) {
                ch = str.buf[str.bufpos++];
                if (!want_unicode && ch >= 0x100)
                    ch = 63; // ch = '?'
                buf[lx] = ch;
                gotnewline = (ch == 10);
            }
        }
        else {
            for (lx=0; lx<len && !gotnewline; lx++) {
                ch = str.buf[str.bufpos++];
                buf[lx] = ch;
                gotnewline = (ch == 10);
            }
        }
        str.readcount += lx;
        return lx;
    default:
        return 0;
    }
}

function gli_get_buffer(str, buf, want_unicode) {
    if (!str || !str.readable)
        return 0;

    var len = buf.length;
    var lx, ch;
    
    switch (str.type) {
    case strtype_File:
        if (str.streaming) {
            for (lx=0; lx<len; lx++) {
                ch = gli_get_char(str, want_unicode);
                if (ch == -1)
                    break;
                buf[lx] = ch;
            }
            return lx;
        }
        /* non-streaming, fall through to resource... */
    case strtype_Resource:
        if (str.unicode) {
            for (lx=0; lx<len; lx++) {
                ch = gli_get_char(str, want_unicode);
                if (ch == -1)
                    break;
                buf[lx] = ch;
            }
            return lx;
        }
        /* non-unicode file/resource, fall through to memory... */
    case strtype_Memory:
        if (str.bufpos >= str.bufeof) {
            len = 0;
        }
        else {
            if (str.bufpos + len > str.bufeof) {
                len = str.bufeof - str.bufpos;
            }
        }
        if (!want_unicode) {
            for (lx=0; lx<len; lx++) {
                ch = str.buf[str.bufpos++];
                if (!want_unicode && ch >= 0x100)
                    ch = 63; // ch = '?'
                buf[lx] = ch;
            }
        }
        else {
            for (lx=0; lx<len; lx++) {
                buf[lx] = str.buf[str.bufpos++];
            }
        }
        str.readcount += len;
        return len;
    default:
        return 0;
    }
}

function gli_stream_fill_result(str, result) {
    if (!result)
        return;
    result.set_field(0, str.readcount);
    result.set_field(1, str.writecount);
}

function glk_put_jstring(val, allbytes) {
    glk_put_jstring_stream(gli_currentstr, val, allbytes);
}

function glk_put_jstring_stream(str, val, allbytes) {
    var ix, len;

    if (!str || !str.writable)
        throw('glk_put_jstring: invalid stream');

    str.writecount += val.length;
    
    switch (str.type) {
    case strtype_File:
        if (str.streaming) {
            if (!str.unicode) {
                // if !allbytes, we just give up on non-Latin-1 characters
                var buf = str.fstream.BufferClass.from(val, 'binary');
                str.fstream.fwrite(buf);
            }
            else {
                if (!str.isbinary) {
                    /* cheap UTF-8 stream */
                    var buf = str.fstream.BufferClass.from(val); // utf8
                    str.fstream.fwrite(buf);
                }
                else {
                    /* cheap big-endian stream */
                    var buf = str.fstream.BufferClass.alloc(4*val.length);
                    for (ix=0; ix<val.length; ix++) {
                        buf.writeUInt32BE(val.charCodeAt(ix), 4*ix, true);
                    }
                    str.fstream.fwrite(buf);
                }
            }
        }
        else {
            /* non-streaming... */
            gli_stream_dirty_file(str);
            var arr = [];
            for (ix=0; ix<val.length; ix++)
                arr.push(val.charCodeAt(ix));
            var arr8;
            if (!str.unicode) {
                arr8 = arr;
            }
            else {
                if (!str.isbinary)
                    arr8 = UniArrayToUTF8(arr);
                else
                    arr8 = UniArrayToBE32(arr);
            }
            var len = arr8.length;
            if (len > str.buflen-str.bufpos)
                len = str.buflen-str.bufpos;
            for (ix=0; ix<len; ix++)
                str.buf[str.bufpos+ix] = arr8[ix];
            str.bufpos += len;
            if (str.bufpos > str.bufeof)
                str.bufeof = str.bufpos;
        }
        break;
    case strtype_Memory:
        len = val.length;
        if (len > str.buflen-str.bufpos)
            len = str.buflen-str.bufpos;
        if (str.unicode || allbytes) {
            for (ix=0; ix<len; ix++)
                str.buf[str.bufpos+ix] = val.charCodeAt(ix);
        }
        else {
            for (ix=0; ix<len; ix++) {
                var ch = val.charCodeAt(ix);
                if (ch < 0 || ch >= 0x100)
                    ch = 63;  // '?'
                str.buf[str.bufpos+ix] = ch;
            }
        }
        str.bufpos += len;
        if (str.bufpos > str.bufeof)
            str.bufeof = str.bufpos;
        break;
    case strtype_Window:
        if (str.win.line_request)
            throw('glk_put_jstring: window has pending line request');
        gli_window_put_string(str.win, val);
        if (str.win.echostr)
            glk_put_jstring_stream(str.win.echostr, val, allbytes);
        break;
    }
}

function gli_set_style(str, val) {
    if (!str || !str.writable)
        throw('gli_set_style: invalid stream');

    if (val >= Const.style_NUMSTYLES)
        val = 0;

    if (str.type == strtype_Window) {
        str.win.style = val;
        if (str.win.echostr)
            gli_set_style(str.win.echostr, val);
    }
}

function gli_set_hyperlink(str, val) {
    if (!str || !str.writable)
        throw('gli_set_hyperlink: invalid stream');

    if (str.type == strtype_Window) {
        str.win.hyperlink = val;
        if (str.win.echostr)
            gli_set_hyperlink(str.win.echostr, val);
    }
}

/* The catalog of Glk API functions. */

function glk_exit() {
    /* For safety, this is fast and idempotent. */
    has_exited = true;
    ui_disabled = true;
    gli_selectref = null;
    if (option_exit_warning)
        GlkOte.warning(option_exit_warning);
    return DidNotReturn;
}

function glk_tick() {
    /* Do nothing. */
}

function glk_gestalt(sel, val) {
    return glk_gestalt_ext(sel, val, null);
}

function glk_gestalt_ext(sel, val, arr) {
    switch (sel) {

    case 0: // gestalt_Version
        /* This implements Glk spec version 0.7.6. */
        return 0x00000706;

    case 1: // gestalt_CharInput
        /* This is not a terrific approximation. Return false for function
           keys, control keys, and the high-bit non-printables. For
           everything else in the Unicode range, return true. */
        if (val <= Const.keycode_Left && val >= Const.keycode_End)
            return 1;
        if (val >= 0x100000000-Const.keycode_MAXVAL)
            return 0;
        if (val > 0x10FFFF)
            return 0;
        if ((val >= 0 && val < 32) || (val >= 127 && val < 160))
            return 0;
        return 1;

    case 2: // gestalt_LineInput
        /* Same as the above, except no special keys. */
        if (val > 0x10FFFF)
            return 0;
        if ((val >= 0 && val < 32) || (val >= 127 && val < 160))
            return 0;
        return 1;

    case 3: // gestalt_CharOutput
        /* Same thing again. We assume that all printable characters,
           as well as the placeholders for nonprintables, are one character
           wide. */
        if ((val > 0x10FFFF) 
            || (val >= 0 && val < 32) 
            || (val >= 127 && val < 160)) {
            if (arr)
                arr[0] = 1;
            return 0; // gestalt_CharOutput_CannotPrint
        }
        if (arr)
            arr[0] = 1;
        return 2; // gestalt_CharOutput_ExactPrint

    case 4: // gestalt_MouseInput
        if (val == Const.wintype_TextBuffer)
            return 1;
        if (val == Const.wintype_Graphics && has_canvas)
            return 1;
        return 0;

    case 5: // gestalt_Timer
        return 1;

    case 6: // gestalt_Graphics
        return 1;

    case 7: // gestalt_DrawImage
    case 24: // gestalt_DrawImageScale
        if (val == Const.wintype_TextBuffer)
            return 1;
        if (val == Const.wintype_Graphics && has_canvas)
            return 1;
        return 0;

    case 8: // gestalt_Sound
        return 0;

    case 9: // gestalt_SoundVolume
        return 0;

    case 10: // gestalt_SoundNotify
        return 0;

    case 11: // gestalt_Hyperlinks
        return 1;

    case 12: // gestalt_HyperlinkInput
        if (val == 3 || val == 4) // TextBuffer or TextGrid
            return 1;
        else
            return 0;

    case 13: // gestalt_SoundMusic
        return 0;

    case 14: // gestalt_GraphicsTransparency
        return 1;

    case 15: // gestalt_Unicode
        return 1;

    case 16: // gestalt_UnicodeNorm
        return 1;

    case 17: // gestalt_LineInputEcho
        return 1;

    case 18: // gestalt_LineTerminators
        return 1;

    case 19: // gestalt_LineTerminatorKey
        /* Really this result should be inspected from glkote.js. Since it
           isn't, be sure to keep these values in sync with 
           terminator_key_names. */
        if (val == Const.keycode_Escape)
            return 1;
        if (val >= Const.keycode_Func12 && val <= Const.keycode_Func1)
            return 1;
        return 0;

    case 20: // gestalt_DateTime
        return 1;

    case 21: // gestalt_Sound2
        return 0;

    case 22: // gestalt_ResourceStream
        return 1;

    case 23: // gestalt_GraphicsCharInput
        return 0;

    }

    if (option_glk_gestalt_hook) {
        var res = option_glk_gestalt_hook(sel, val, arr);
        if (res !== undefined)
            return res;
    }

    return 0;
}

function glk_window_iterate(win, rockref) {
    if (!win)
        win = gli_windowlist;
    else
        win = win.next;

    if (win) {
        if (rockref)
            rockref.set_value(win.rock);
        return win;
    }

    if (rockref)
        rockref.set_value(0);
    return null;
}

function glk_window_get_rock(win) {
    if (!win)
        throw('glk_window_get_rock: invalid window');
    return win.rock;
}

function glk_window_get_root() {
    return gli_rootwin;
}

function glk_window_open(splitwin, method, size, wintype, rock) {
    var oldparent, box, val;
    var pairwin, newwin;

    if (!gli_rootwin) {
        if (splitwin)
            throw('glk_window_open: splitwin must be null for first window');

        oldparent = null;
        box = {
            left: content_metrics.outspacingx,
            top: content_metrics.outspacingy,
            right: content_metrics.width-content_metrics.outspacingx,
            bottom: content_metrics.height-content_metrics.outspacingy
        };
    }
    else {
        if (!splitwin)
            throw('glk_window_open: splitwin must not be null');

        val = (method & Const.winmethod_DivisionMask);
        if (val != Const.winmethod_Fixed && val != Const.winmethod_Proportional)
            throw('glk_window_open: invalid method (not fixed or proportional)');

        val = (method & Const.winmethod_DirMask);
        if (val != Const.winmethod_Above && val != Const.winmethod_Below 
            && val != Const.winmethod_Left && val != Const.winmethod_Right) 
            throw('glk_window_open: invalid method (bad direction)');
        
        box = splitwin.bbox;

        oldparent = splitwin.parent;
        if (oldparent && oldparent.type != Const.wintype_Pair) 
            throw('glk_window_open: parent window is not Pair');
    }

    newwin = gli_new_window(wintype, rock);

    switch (newwin.type) {
    case Const.wintype_TextBuffer:
        /* accum is a list of strings of a given style; newly-printed text
           is pushed onto the list. accumstyle is the style of that text.
           Anything printed in a different style (or hyperlink value)
           triggers a call to gli_window_buffer_deaccumulate, which cleans
           out accum and adds the results to the content array. The content
           is in GlkOte format.
        */
        newwin.accum = [];
        newwin.accumstyle = null;
        newwin.accumhyperlink = 0;
        newwin.content = [];
        newwin.clearcontent = false;
        newwin.reserve = []; /* autosave of recent content */
        break;
    case Const.wintype_TextGrid:
        /* lines is a list of line objects. A line looks like
           { chars: [...], styles: [...], hyperlinks: [...], dirty: bool }.
        */
        newwin.gridwidth = 0;
        newwin.gridheight = 0;
        newwin.lines = [];
        newwin.cursorx = 0;
        newwin.cursory = 0;
        break;
    case Const.wintype_Graphics:
        if (!has_canvas) {
            /* Graphics windows not supported; silently return null */
            gli_delete_window(newwin);
            return null;
        }
        newwin.content = [];
        newwin.reserve = []; /* autosave of recent content */
        break;
    case Const.wintype_Blank:
        break;
    case Const.wintype_Pair:
        throw('glk_window_open: cannot open pair window directly')
    default:
        /* Silently return null */
        gli_delete_window(newwin);
        return null;
    }

    if (!splitwin) {
        gli_rootwin = newwin;
        gli_window_rearrange(newwin, box);
    }
    else {
        /* create pairwin, with newwin as the key */
        pairwin = gli_new_window(Const.wintype_Pair, 0);
        pairwin.pair_dir = method & Const.winmethod_DirMask;
        pairwin.pair_division = method & Const.winmethod_DivisionMask;
        pairwin.pair_key = newwin;
        pairwin.pair_keydamage = false;
        pairwin.pair_size = size;
        pairwin.pair_hasborder = ((method & Const.winmethod_BorderMask) == Const.winmethod_Border);
        pairwin.pair_vertical = (pairwin.pair_dir == Const.winmethod_Left || pairwin.pair_dir == Const.winmethod_Right);
        pairwin.pair_backward = (pairwin.pair_dir == Const.winmethod_Left || pairwin.pair_dir == Const.winmethod_Above);

        pairwin.child1 = splitwin;
        pairwin.child2 = newwin;
        splitwin.parent = pairwin;
        newwin.parent = pairwin;
        pairwin.parent = oldparent;

        if (oldparent) {
            if (oldparent.child1 == splitwin)
                oldparent.child1 = pairwin;
            else
                oldparent.child2 = pairwin;
        }
        else {
            gli_rootwin = pairwin;
        }

        gli_window_rearrange(pairwin, box);
    }

    return newwin;
}

function glk_window_close(win, statsref) {
    if (!win)
        throw('glk_window_close: invalid window');

    if (win === gli_rootwin || !win.parent) {
        /* close the root window, which means all windows. */
        
        gli_rootwin = null;
        
        /* begin (simpler) closation */
        
        gli_stream_fill_result(win.str, statsref);
        gli_window_close(win, true); 
    }
    else {
        /* have to jigger parent */
        var pairwin, grandparwin, sibwin, box, wx, keydamage_flag;

        pairwin = win.parent;
        if (win === pairwin.child1)
            sibwin = pairwin.child2;
        else if (win === pairwin.child2)
            sibwin = pairwin.child1;
        else
            throw('glk_window_close: window tree is corrupted');

        box = pairwin.bbox;

        grandparwin = pairwin.parent;
        if (!grandparwin) {
            gli_rootwin = sibwin;
            sibwin.parent = null;
        }
        else {
            if (grandparwin.child1 === pairwin)
                grandparwin.child1 = sibwin;
            else
                grandparwin.child2 = sibwin;
            sibwin.parent = grandparwin;
        }
        
        /* Begin closation */
        
        gli_stream_fill_result(win.str, statsref);

        /* Close the child window (and descendants), so that key-deletion can
            crawl up the tree to the root window. */
        gli_window_close(win, true); 

        /* This probably isn't necessary, but the child *is* gone, so just
            in case. */
        if (win === pairwin.child1) {
            pairwin.child1 = null;
        }
        else if (win === pairwin.child2) {
            pairwin.child2 = null;
        }
        
        /* Now we can delete the parent pair. */
        gli_window_close(pairwin, false);

        keydamage_flag = false;
        for (wx=sibwin; wx; wx=wx.parent) {
            if (wx.type == Const.wintype_Pair) {
                if (wx.pair_keydamage) {
                    keydamage_flag = true;
                    wx.pair_keydamage = false;
                }
            }
        }
        
        if (keydamage_flag) {
            box = content_box;
            gli_window_rearrange(gli_rootwin, box);
        }
        else {
            gli_window_rearrange(sibwin, box);
        }
    }
}

function glk_window_get_size(win, widthref, heightref) {
    if (!win)
        throw('glk_window_get_size: invalid window');

    var wid = 0;
    var hgt = 0;
    var boxwidth, boxheight;

    switch (win.type) {

    case Const.wintype_TextGrid:
        boxwidth = win.bbox.right - win.bbox.left;
        boxheight = win.bbox.bottom - win.bbox.top;
        wid = Math.max(0, Math.floor((boxwidth-content_metrics.gridmarginx) / content_metrics.gridcharwidth));
        hgt = Math.max(0, Math.floor((boxheight-content_metrics.gridmarginy) / content_metrics.gridcharheight));        
        break;

    case Const.wintype_TextBuffer:
        boxwidth = win.bbox.right - win.bbox.left;
        boxheight = win.bbox.bottom - win.bbox.top;
        wid = Math.max(0, Math.floor((boxwidth-content_metrics.buffermarginx) / content_metrics.buffercharwidth));
        hgt = Math.max(0, Math.floor((boxheight-content_metrics.buffermarginy) / content_metrics.buffercharheight));        
        break;

    case Const.wintype_Graphics:
        boxwidth = win.bbox.right - win.bbox.left;
        boxheight = win.bbox.bottom - win.bbox.top;
        wid = boxwidth - content_metrics.graphicsmarginx;
        hgt = boxheight - content_metrics.graphicsmarginy;
        break;
    }

    if (widthref)
        widthref.set_value(wid);
    if (heightref)
        heightref.set_value(hgt);
}

function glk_window_set_arrangement(win, method, size, keywin) {
    var wx, newdir, newvertical, newbackward;

    if (!win)
        throw('glk_window_set_arrangement: invalid window');
    if (win.type != Const.wintype_Pair) 
        throw('glk_window_set_arrangement: not a pair window');

    if (keywin) {
        if (keywin.type == Const.wintype_Pair)
            throw('glk_window_set_arrangement: keywin cannot be a pair window');
        for (wx=keywin; wx; wx=wx.parent) {
            if (wx == win)
                break;
        }
        if (!wx)
            throw('glk_window_set_arrangement: keywin must be a descendant');
    }

    newdir = method & Const.winmethod_DirMask;
    newvertical = (newdir == Const.winmethod_Left || newdir == Const.winmethod_Right);
    newbackward = (newdir == Const.winmethod_Left || newdir == Const.winmethod_Above);
    if (!keywin)
        keywin = win.pair_key;

    if (newvertical && !win.pair_vertical)
        throw('glk_window_set_arrangement: split must stay horizontal');
    if (!newvertical && win.pair_vertical)
        throw('glk_window_set_arrangement: split must stay vertical');

    if (keywin && keywin.type == Const.wintype_Blank
        && (method & Const.winmethod_DivisionMask) == Const.winmethod_Fixed) 
        throw('glk_window_set_arrangement: a blank window cannot have a fixed size');

    if ((newbackward && !win.pair_backward) || (!newbackward && win.pair_backward)) {
        /* switch the children */
        wx = win.child1;
        win.child1 = win.child2;
        win.child2 = wx;
    }

    /* set up everything else */
    win.pair_dir = newdir;
    win.pair_division = (method & Const.winmethod_DivisionMask);
    win.pair_key = keywin;
    win.pair_size = size;

    win.pair_hasborder = ((method & Const.winmethod_BorderMask) == Const.winmethod_Border);
    win.pair_vertical = (win.pair_dir == Const.winmethod_Left || win.pair_dir == Const.winmethod_Right);
    win.pair_backward = (win.pair_dir == Const.winmethod_Left || win.pair_dir == Const.winmethod_Above);

    gli_window_rearrange(win, win.bbox);
}

function glk_window_get_arrangement(win, methodref, sizeref, keywinref) {
    if (!win)
        throw('glk_window_get_arrangement: invalid window');
    if (win.type != Const.wintype_Pair) 
        throw('glk_window_get_arrangement: not a pair window');

    if (sizeref)
        sizeref.set_value(win.pair_size);
    if (keywinref)
        keywinref.set_value(win.pair_key);
    if (methodref)
        methodref.set_value(win.pair_dir | win.pair_division | (win.pair_hasborder ? Const.winmethod_Border : Const.winmethod_NoBorder));
}

function glk_window_get_type(win) {
    if (!win)
        throw('glk_window_get_type: invalid window');
    return win.type;
}

function glk_window_get_parent(win) {
    if (!win)
        throw('glk_window_get_parent: invalid window');
    return win.parent;
}

function glk_window_clear(win) {
    var ix, cx, lineobj;

    if (!win)
        throw('glk_window_clear: invalid window');
    
    if (win.line_request) {
        throw('glk_window_clear: window has pending line request');
    }

    switch (win.type) {
    case Const.wintype_TextBuffer:
        win.accum.length = 0;
        win.accumstyle = null;
        win.accumhyperlink = 0;
        win.content.length = 0;
        win.clearcontent = true;
        break;
    case Const.wintype_TextGrid:
        win.cursorx = 0;
        win.cursory = 0;
        for (ix=0; ix<win.gridheight; ix++) {
            lineobj = win.lines[ix];
            lineobj.dirty = true;
            for (cx=0; cx<win.gridwidth; cx++) {
                lineobj.chars[cx] = ' ';
                lineobj.styles[cx] = Const.style_Normal;
                lineobj.hyperlinks[cx] = 0;
            }
        }
        break;
    case Const.wintype_Graphics:
        /* If the background color has been set, we must retain that entry.
           (The last setcolor, if there are several.) */
        var setcol = null;
        for (var ix=0; ix<win.content.length; ix++) {
            if (win.content[ix].special == 'setcolor')
                setcol = win.content[ix];
        }
        win.content.length = 0;
        if (setcol !== null)
            win.content.push(setcol);
        win.content.push({ special: 'fill' }); /* clear to background color */
        break;
    }
}

function glk_window_move_cursor(win, xpos, ypos) {
    if (!win)
        throw('glk_window_move_cursor: invalid window');
    
    if (win.type == Const.wintype_TextGrid) {
        /* No bounds-checking; we canonicalize when we print. */
        win.cursorx = xpos;
        win.cursory = ypos;
    }
    else {
        throw('glk_window_move_cursor: not a grid window');
    }
}

function glk_window_get_stream(win) {
    if (!win)
        throw('glk_window_get_stream: invalid window');
    return win.str;
}

function glk_window_set_echo_stream(win, str) {
    if (!win)
        throw('glk_window_set_echo_stream: invalid window');
    win.echostr = str;
}

function glk_window_get_echo_stream(win) {
    if (!win)
        throw('glk_window_get_echo_stream: invalid window');
    return win.echostr;
}

function glk_set_window(win) {
    if (!win)
        gli_currentstr = null;
    else
        gli_currentstr = win.str;
}

function glk_window_get_sibling(win) {
    var parent, sib;
    if (!win)
        throw('glk_window_get_sibling: invalid window');
    parent = win.parent;
    if (!parent)
        return null;
    if (win === parent.child1)
        return parent.child2;
    else if (win === parent.child2)
        return parent.child1;
    else
        throw('glk_window_get_sibling: window tree is corrupted');
}

function glk_stream_iterate(str, rockref) {
    if (!str)
        str = gli_streamlist;
    else
        str = str.next;

    if (str) {
        if (rockref)
            rockref.set_value(str.rock);
        return str;
    }

    if (rockref)
        rockref.set_value(0);
    return null;
}

function glk_stream_get_rock(str) {
    if (!str)
        throw('glk_stream_get_rock: invalid stream');
    return str.rock;
}

function glk_stream_open_file(fref, fmode, rock) {
    var Dialog = GlkOte.getlibrary('Dialog');
    
    if (!fref)
        throw('glk_stream_open_file: invalid fileref');

    var str;
    var fstream;

    if (fmode != Const.filemode_Read 
        && fmode != Const.filemode_Write 
        && fmode != Const.filemode_ReadWrite 
        && fmode != Const.filemode_WriteAppend) 
        throw('glk_stream_open_file: illegal filemode');

    if (fmode == Const.filemode_Read && !Dialog.file_ref_exists(fref.ref))
        return null;

    if (!Dialog.streaming) {
        var content = null;
        if (fmode != Const.filemode_Write) {
            content = Dialog.file_read(fref.ref);
        }
        if (content == null) {
            content = [];
            if (fmode != Const.filemode_Read) {
                /* We just created this file. (Or perhaps we're in Write mode
                   and we're truncating.) Write immediately, to create it and
                   get the creation date right. */
                Dialog.file_write(fref.ref, '', true);
            }
        }
        if (content.length == null) 
            throw('glk_stream_open_file: data read had no length');
    }
    else {
        fstream = Dialog.file_fopen(fmode, fref.ref);
        if (!fstream)
            return null;
    }

    str = gli_new_stream(strtype_File, 
        (fmode != Const.filemode_Write), 
        (fmode != Const.filemode_Read), 
        rock);
    str.unicode = false;
    str.isbinary = !fref.textmode;
    str.ref = fref.ref;
    str.origfmode = fmode;

    if (!Dialog.streaming) {
        str.streaming = false;
        str.buf = content;
        str.buflen = 0xFFFFFFFF; /* enormous */
        if (fmode == Const.filemode_Write)
            str.bufeof = 0;
        else
            str.bufeof = content.length;
        if (fmode == Const.filemode_WriteAppend)
            str.bufpos = str.bufeof;
        else
            str.bufpos = 0;
    }
    else {
        str.streaming = true;
        str.fstream = fstream;
        /* We'll want a Buffer object around for short and writes. */
        str.buffer4 = fstream.BufferClass.alloc(4);
    }

    return str;
}

function glk_stream_open_memory(buf, fmode, rock) {
    var str;

    if (fmode != Const.filemode_Read 
        && fmode != Const.filemode_Write 
        && fmode != Const.filemode_ReadWrite) 
        throw('glk_stream_open_memory: illegal filemode');

    str = gli_new_stream(strtype_Memory, 
        (fmode != Const.filemode_Write), 
        (fmode != Const.filemode_Read), 
        rock);
    str.unicode = false;

    if (buf) {
        str.buf = buf;
        str.buflen = buf.length;
        str.bufpos = 0;
        if (fmode == Const.filemode_Write)
            str.bufeof = 0;
        else
            str.bufeof = str.buflen;
        if (GiDispa)
            GiDispa.retain_array(buf);
    }

    return str;
}

function glk_stream_open_resource(filenum, rock) {
    var str;

    if (!Blorb)
        return null;
    var el = Blorb.get_data_chunk(filenum);
    if (!el)
        return null;

    var buf = el.data;

    str = gli_new_stream(strtype_Resource,
        true, 
        false, 
        rock);
    str.unicode = false;
    str.isbinary = el.binary;

    str.resfilenum = filenum;

    /* Resource streams always use buffer mode. */
    str.streaming = false;

    /* We have been handed an array of bytes. (They're big-endian four-byte
       chunks, or perhaps a UTF-8 byte sequence, rather than native-endian
       four-byte integers). We'll have to do the translation in the get()
       functions. */

    if (buf) {
        str.buf = buf;
        str.buflen = buf.length;
        str.bufpos = 0;
        str.bufeof = str.buflen;
    }

    return str;
}

function glk_stream_open_resource_uni(filenum, rock) {
    var str;

    if (!Blorb)
        return null;
    var el = Blorb.get_data_chunk(filenum);
    if (!el)
        return null;

    var buf = el.data;

    str = gli_new_stream(strtype_Resource,
        true, 
        false, 
        rock);
    str.unicode = true;
    str.isbinary = el.binary;

    str.resfilenum = filenum;

    /* Resource streams always use buffer mode. */
    str.streaming = false;

    /* We have been handed an array of bytes. (They're big-endian four-byte
       chunks, or perhaps a UTF-8 byte sequence, rather than native-endian
       four-byte integers). We'll have to do the translation in the get()
       functions. */

    if (buf) {
        str.buf = buf;
        str.buflen = buf.length;
        str.bufpos = 0;
        str.bufeof = str.buflen;
    }

    return str;
}

function glk_stream_close(str, result) {
    var Dialog = GlkOte.getlibrary('Dialog');
    
    if (!str)
        throw('glk_stream_close: invalid stream');

    if (str.type == strtype_Window)
        throw('glk_stream_close: cannot close window stream');

    if (str.type == strtype_File && str.writable) {
        if (!str.streaming) {
            if (!(str.timer_id === null)) {
                clearTimeout(str.timer_id);
                str.timer_id = null;
            }
            Dialog.file_write(str.ref, str.buf);
        }
    }

    gli_stream_fill_result(str, result);
    gli_delete_stream(str);
}

function glk_stream_set_position(str, pos, seekmode) {
    if (!str)
        throw('glk_stream_set_position: invalid stream');

    switch (str.type) {
    case strtype_File:
        if (str.streaming) {
            str.fstream.fseek(pos, seekmode);
            break;
        }
        //### check if file has been modified? This is a half-decent time.
        /* fall through to memory... */
    case strtype_Resource:
        /* fall through to memory... */
    case strtype_Memory:
        if (seekmode == Const.seekmode_Current) {
            pos = str.bufpos + pos;
        }
        else if (seekmode == Const.seekmode_End) {
            pos = str.bufeof + pos;
        }
        else {
            /* pos = pos */
        }
        if (pos < 0)
            pos = 0;
        if (pos > str.bufeof)
            pos = str.bufeof;
        str.bufpos = pos;
    }
}

function glk_stream_get_position(str) {
    if (!str)
        throw('glk_stream_get_position: invalid stream');

    switch (str.type) {
    case strtype_File:
        if (str.streaming) {
            return str.fstream.ftell();
        }
        /* fall through to memory... */
    case strtype_Resource:
        /* fall through to memory... */
    case strtype_Memory:
        return str.bufpos;
    default:
        return 0;
    }
}

function glk_stream_set_current(str) {
    gli_currentstr = str;
}

function glk_stream_get_current() {
    return gli_currentstr;
}

function glk_fileref_create_temp(usage, rock) {
    var Dialog = GlkOte.getlibrary('Dialog');
    var filetype = (usage & Const.fileusage_TypeMask);
    var filetypename = FileTypeMap[filetype];
    var ref = Dialog.file_construct_temp_ref(filetypename);
    var fref = gli_new_fileref(ref.filename, usage, rock, ref);
    return fref;
}

function glk_fileref_create_by_name(usage, filename, rock) {
    var Dialog = GlkOte.getlibrary('Dialog');
    
    /* Filenames that do not come from the user must be cleaned up. */
    filename = Dialog.file_clean_fixed_name(filename, (usage & Const.fileusage_TypeMask));

    var fref = gli_new_fileref(filename, usage, rock, null);
    return fref;
}

function glk_fileref_create_by_prompt(usage, fmode, rock) {
    var modename;

    var filetype = (usage & Const.fileusage_TypeMask);
    var filetypename = FileTypeMap[filetype];
    if (!filetypename) {
        filetypename = 'xxx';
    }

    switch (fmode) {
        case Const.filemode_Write:
            modename = 'write';
            break;
        case Const.filemode_ReadWrite:
            modename = 'readwrite';
            break;
        case Const.filemode_WriteAppend:
            modename = 'writeappend';
            break;
        case Const.filemode_Read:
        default:
            modename = 'read';
            break;
    }

    var special = {
        type: 'fileref_prompt',
        filetype: filetypename,
        filemode: modename
    };
    var callback = {
        usage: usage,
        rock: rock
    };

    if (filetype == Const.fileusage_SavedGame)
        special.gameid = VM.get_signature();

    ui_specialinput = special;
    ui_specialcallback = callback;
    gli_selectref = null;
    return DidNotReturn;
}

function gli_fileref_create_by_prompt_callback(obj) {
    var ref = obj.value;
    /* This "value" field will be a dialog.js fileref object if we are
       connected to GlkOte. However, if we are connected to RegTest,
       it will be a plain string. We attempt to handle both cases. */

    var usage = ui_specialcallback.usage;
    var rock = ui_specialcallback.rock;

    var fref = null;
    if (ref && typeof(ref) == 'object') {
        fref = gli_new_fileref(ref.filename, usage, rock, ref);
    }
    else if (ref && typeof(ref) == 'string') {
        fref = gli_new_fileref(ref, usage, rock, null);
    }

    ui_specialinput = null;
    ui_specialcallback = null;

    if (GiDispa)
        GiDispa.prepare_resume(fref);
    VM.resume(fref);
}

function glk_fileref_destroy(fref) {
    if (!fref)
        throw('glk_fileref_destroy: invalid fileref');
    gli_delete_fileref(fref);
}

function glk_fileref_iterate(fref, rockref) {
    if (!fref)
        fref = gli_filereflist;
    else
        fref = fref.next;

    if (fref) {
        if (rockref)
            rockref.set_value(fref.rock);
        return fref;
    }

    if (rockref)
        rockref.set_value(0);
    return null;
}

function glk_fileref_get_rock(fref) {
    if (!fref)
        throw('glk_fileref_get_rock: invalid fileref');
    return fref.rock;
}

function glk_fileref_delete_file(fref) {
    var Dialog = GlkOte.getlibrary('Dialog');
    if (!fref)
        throw('glk_fileref_delete_file: invalid fileref');
    Dialog.file_remove_ref(fref.ref);
}

function glk_fileref_does_file_exist(fref) {
    var Dialog = GlkOte.getlibrary('Dialog');
    if (!fref)
        throw('glk_fileref_does_file_exist: invalid fileref');
    if (Dialog.file_ref_exists(fref.ref))
        return 1;
    else
        return 0;
}

function glk_fileref_create_from_fileref(usage, oldfref, rock) {
    if (!oldfref)
        throw('glk_fileref_create_from_fileref: invalid fileref');
    
    var fref = gli_new_fileref(oldfref.filename, usage, rock, null);
    return fref;
}

function glk_put_char(ch) {
    gli_put_char(gli_currentstr, ch & 0xFF);
}

function glk_put_char_stream(str, ch) {
    gli_put_char(str, ch & 0xFF);
}

function glk_put_string(val) {
    glk_put_jstring_stream(gli_currentstr, val, true);
}

function glk_put_string_stream(str, val) {
    glk_put_jstring_stream(str, val, true);
}

function glk_put_buffer(arr) {
    arr = TrimArrayToBytes(arr);
    gli_put_array(gli_currentstr, arr, true);
}

function glk_put_buffer_stream(str, arr) {
    arr = TrimArrayToBytes(arr);
    gli_put_array(str, arr, true);
}

function glk_set_style(val) {
    gli_set_style(gli_currentstr, val);
}

function glk_set_style_stream(str, val) {
    gli_set_style(str, val);
}

function glk_get_char_stream(str) {
    if (!str)
        throw('glk_get_char_stream: invalid stream');
    return gli_get_char(str, false);
}

function glk_get_line_stream(str, buf) {
    if (!str)
        throw('glk_get_line_stream: invalid stream');
    return gli_get_line(str, buf, false);
}

function glk_get_buffer_stream(str, buf) {
    if (!str)
        throw('glk_get_buffer_stream: invalid stream');
    return gli_get_buffer(str, buf, false);
}

function glk_char_to_lower(val) {
    if (val >= 0x41 && val <= 0x5A)
        return val + 0x20;
    if (val >= 0xC0 && val <= 0xDE && val != 0xD7)
        return val + 0x20;
    return val;
}

function glk_char_to_upper(val) {
    if (val >= 0x61 && val <= 0x7A)
        return val - 0x20;
    if (val >= 0xE0 && val <= 0xFE && val != 0xF7)
        return val - 0x20;
    return val;
}

/* Style hints are not supported. We will use the new style system. */
function glk_stylehint_set(wintype, styl, hint, value) { }
function glk_stylehint_clear(wintype, styl, hint) { }
function glk_style_distinguish(win, styl1, styl2) {
    return 0;
}
function glk_style_measure(win, styl, hint, resultref) {
    if (resultref)
        resultref.set_value(0);
    return 0;
}

function glk_select(eventref) {
    gli_selectref = eventref;
    return DidNotReturn;
}

function glk_select_poll(eventref) {
    /* Because the Javascript interpreter is single-threaded, we cannot
       have gotten a timer event since the last glk_select call. */

    eventref.set_field(0, Const.evtype_None);
    eventref.set_field(1, null);
    eventref.set_field(2, 0);
    eventref.set_field(3, 0);

    if (gli_timer_interval) {
        var now = Date.now();
        if (now - gli_timer_started > gli_timer_interval) {
            /* We're past the timer interval, even though we got no
               event. Let's pretend we did, reset it, and return a
               timer event. */
            gli_timer_started = Date.now();
            /* Resend timer request at next update. */
            gli_timer_lastsent = null;

            eventref.set_field(0, Const.evtype_Timer);
        }
    }
}

function glk_request_line_event(win, buf, initlen) {
    if (!win)
        throw('glk_request_line_event: invalid window');
    if (win.char_request || win.line_request)
        throw('glk_request_line_event: window already has keyboard request');

    if (win.type == Const.wintype_TextBuffer 
        || win.type == Const.wintype_TextGrid) {
        if (initlen) {
            /* This will be copied into the next update. */
            var ls = buf.slice(0, initlen);
            if (!current_partial_outputs)
                current_partial_outputs = {};
            current_partial_outputs[win.disprock] = ByteArrayToString(ls);
        }
        win.line_request = true;
        win.line_request_uni = false;
        if (win.type == Const.wintype_TextBuffer)
            win.request_echo_line_input = win.echo_line_input;
        else
            win.request_echo_line_input = true;
        win.input_generation = event_generation;
        win.linebuf = buf;
        if (GiDispa)
            GiDispa.retain_array(buf);
    }
    else {
        throw('glk_request_line_event: window does not support keyboard input');
    }
}

function glk_cancel_line_event(win, eventref) {
    if (!win)
        throw('glk_cancel_line_event: invalid window');

    if (!win.line_request) {
        if (eventref) {
            eventref.set_field(0, Const.evtype_None);
            eventref.set_field(1, null);
            eventref.set_field(2, 0);
            eventref.set_field(3, 0);
        }
        return;
    }

    var input = "";
    var ix, val;

    if (current_partial_inputs) {
        val = current_partial_inputs[win.disprock];
        if (val) 
            input = val;
    }

    if (input.length > win.linebuf.length)
        input = input.slice(0, win.linebuf.length);

    if (win.request_echo_line_input) {
        ix = win.style;
        gli_set_style(win.str, Const.style_Input);
        gli_window_put_string(win, input);
        if (win.echostr)
            glk_put_jstring_stream(win.echostr, input);
        gli_set_style(win.str, ix);
        gli_window_put_string(win, "\n");
        if (win.echostr)
            glk_put_jstring_stream(win.echostr, "\n");
    }

    for (ix=0; ix<input.length; ix++)
        win.linebuf[ix] = input.charCodeAt(ix);

    if (eventref) {
        eventref.set_field(0, Const.evtype_LineInput);
        eventref.set_field(1, win);
        eventref.set_field(2, input.length);
        eventref.set_field(3, 0);
    }

    if (GiDispa)
        GiDispa.unretain_array(win.linebuf);
    win.line_request = false;
    win.line_request_uni = false;
    win.request_echo_line_input = null;
    win.input_generation = null;
    win.linebuf = null;
}

function glk_request_char_event(win) {
    if (!win)
        throw('glk_request_char_event: invalid window');
    if (win.char_request || win.line_request)
        throw('glk_request_char_event: window already has keyboard request');

    if (win.type == Const.wintype_TextBuffer 
        || win.type == Const.wintype_TextGrid) {
        win.char_request = true;
        win.char_request_uni = false;
        win.input_generation = event_generation;
    }
    else {
        /* ### wintype_Graphics could accept char input if we set up the focus to allow it. See gestalt_GraphicsCharInput. */
        throw('glk_request_char_event: window does not support keyboard input');
    }
}

function glk_cancel_char_event(win) {
    if (!win)
        throw('glk_cancel_char_event: invalid window');

    win.char_request = false;
    win.char_request_uni = false;
}

function glk_set_echo_line_event(win, val) {
   if (!win)
        throw('glk_set_echo_line_event: invalid window');

   win.echo_line_input = (val != 0);
}

function glk_set_terminators_line_event(win, arr) {
   if (!win)
        throw('glk_set_terminators_line_event: invalid window');

   if (KeystrokeValueMap === null) {
       /* First, we have to build this map. (It's only used by this
          function, which is why the constructor code is here. */
       KeystrokeValueMap = {};
       for (var val in KeystrokeNameMap) {
           KeystrokeValueMap[KeystrokeNameMap[val]] = val;
       }
   }

   var res = [];
   if (arr) {
       for (var ix=0; ix<arr.length; ix++) {
           var val = KeystrokeValueMap[arr[ix]];
           if (val)
               res.push(val);
       }
   }
   win.line_input_terminators = res;
}

function glk_request_mouse_event(win) {
    if (!win)
        throw('glk_request_mouse_event: invalid window');
    if (win.type == Const.wintype_TextGrid
        || win.type == Const.wintype_Graphics) {
        win.mouse_request = true;
    }
    /* else ignore request */
}

function glk_cancel_mouse_event(win) {
    if (!win)
        throw('glk_cancel_mouse_event: invalid window');
    win.mouse_request = false;
}

function glk_request_timer_events(msec) {
    if (!msec) {
        gli_timer_interval = null;
        gli_timer_started = null;
    }
    else {
        gli_timer_interval = msec;
        gli_timer_started = Date.now();
    }
}

/* Graphics functions. */

function glk_image_get_info(imgid, widthref, heightref) {
    if (!Blorb || !Blorb.get_image_info)
        return null;

    var info = Blorb.get_image_info(imgid);
    if (info) {
        if (widthref)
            widthref.set_value(info.width);
        if (heightref)
            heightref.set_value(info.height);
        return 1;
    }
    if (widthref)
        widthref.set_value(0);
    if (heightref)
        heightref.set_value(0);
    return 0;
}

function glk_image_draw(win, imgid, val1, val2) {
    if (!win)
        throw('glk_image_draw: invalid window');

    if (!Blorb || !Blorb.get_image_info)
        return 0;
    var info = Blorb.get_image_info(imgid);
    if (!info)
        return 0;

    /* info.url and info.alttext may be undefined, but we copy them if
       provided. */
    var img = { special:'image', image:imgid, 
                url:info.url, alttext:info.alttext,
                width:info.width, height:info.height };

    switch (win.type) {
    case Const.wintype_TextBuffer:
        var alignment = 'inlineup';
        switch (val1) {
            case Const.imagealign_InlineUp:
                alignment = 'inlineup';
                break;
            case Const.imagealign_InlineDown:
                alignment = 'inlinedown';
                break;
            case Const.imagealign_InlineCenter:
                alignment = 'inlinecenter';
                break;
            case Const.imagealign_MarginLeft:
                alignment = 'marginleft';
                break;
            case Const.imagealign_MarginRight:
                alignment = 'marginright';
                break;
        }
        img.alignment = alignment;
        if (win.hyperlink)
            img.hyperlink = win.hyperlink;
        gli_window_buffer_put_special(win, img);
        return 1;

    case Const.wintype_Graphics:
        img.x = val1;
        img.y = val2;
        win.content.push(img);
        return 1;
    }

    return 0;
}

function glk_image_draw_scaled(win, imgid, val1, val2, width, height) {
    if (!win)
        throw('glk_image_draw_scaled: invalid window');

    if (!Blorb || !Blorb.get_image_info)
        return 0;
    var info = Blorb.get_image_info(imgid);
    if (!info)
        return 0;

    /* Same as above, except we use the passed-in width and height
       values. Note that by omitting winmaxwidth, we will implicitly
       limit maxwidth to the window width (in buffer windows). */
    var img = { special:'image', image:imgid, 
                url:info.url, alttext:info.alttext,
                width:width, height:height };

    switch (win.type) {
    case Const.wintype_TextBuffer:
        var alignment = 'inlineup';
        switch (val1) {
            case Const.imagealign_InlineUp:
                alignment = 'inlineup';
                break;
            case Const.imagealign_InlineDown:
                alignment = 'inlinedown';
                break;
            case Const.imagealign_InlineCenter:
                alignment = 'inlinecenter';
                break;
            case Const.imagealign_MarginLeft:
                alignment = 'marginleft';
                break;
            case Const.imagealign_MarginRight:
                alignment = 'marginright';
                break;
        }
        img.alignment = alignment;
        if (win.hyperlink)
            img.hyperlink = win.hyperlink;
        gli_window_buffer_put_special(win, img);
        return 1;

    case Const.wintype_Graphics:
        img.x = val1;
        img.y = val2;
        /* width, height already set */
        win.content.push(img);
        return 1;
    }

    return 0;
}

function glk_image_draw_scaled_ext(win, imgid, val1, val2, width, height, imagerule, maxwidth) {
    if (!win)
        throw('glk_image_draw_scaled_ext: invalid window');

    if (!Blorb || !Blorb.get_image_info)
        return 0;
    var info = Blorb.get_image_info(imgid);
    if (!info)
        return 0;

    /* Same as above, except we have more ways to calculate the width and
       height. */
    var img = { special:'image', image:imgid, 
                url:info.url, alttext:info.alttext };

    var widthrule = (imagerule & Const.imagerule_WidthMask);
    var heightrule = (imagerule & Const.imagerule_HeightMask);

    if (win.type == Const.wintype_Graphics) {
        /* For graphics windows, we can (and should) calculate ratios
           now. We ignore maxwidth. */
        if (widthrule == Const.imagerule_WidthRatio) {
            widthrule = Const.imagerule_WidthFixed;
            width = win.graphwidth * (width / 0x10000);
        }
        if (heightrule == Const.imagerule_AspectRatio) {
            heightrule = Const.imagerule_HeightFixed;
            var aspect = (info.height / info.width);
            height = width * aspect * (height / 0x10000);
        }
        maxwidth = 0;
    }
    
    switch (widthrule) {
    case Const.imagerule_WidthOrig:
        img.width = info.width;
        break;
    case Const.imagerule_WidthFixed:
        img.width = width; /* passed in */
        break;
    case Const.imagerule_WidthRatio:
        img.widthratio = (width / 0x10000); /* passed in, 16.16 */
        break;
    default:
        throw('glk_image_draw_scaled_ext: invalid widthrule');
    }

    switch (heightrule) {
    case Const.imagerule_HeightOrig:
        img.height = info.height;
        break;
    case Const.imagerule_HeightFixed:
        img.height = height; /* passed in */
        break;
    case Const.imagerule_AspectRatio:
        var aspectratio = (height / 0x10000); /* passed in, 16.16 */
        img.aspectwidth = info.width;
        img.aspectheight = info.height * aspectratio;
        break;
    default:
        throw('glk_image_draw_scaled_ext: invalid heightrule');
    }

    if (maxwidth == 0) {
        /* We always wind up here for graphics windows. */
        img.winmaxwidth = null;
    }
    else {
        var maxwidthf = (maxwidth / 0x10000);
        img.winmaxwidth = maxwidthf;
        
        if (widthrule == Const.imagerule_WidthRatio) {
            /* The width is already scaled to the window width, so maxwidth
               is irrelevant. Drop it. But if our width is *wider* than the
               window width, scale down proportionally. */
            if (img.widthratio > img.winmaxwidth) {
                if (img.height !== undefined)
                    img.height = img.height * (img.winmaxwidth / img.widthratio);
                img.widthratio = img.winmaxwidth;
            }
            img.winmaxwidth = null;
        }
    }
    
    switch (win.type) {
    case Const.wintype_TextBuffer:
        var alignment = 'inlineup';
        switch (val1) {
            case Const.imagealign_InlineUp:
                alignment = 'inlineup';
                break;
            case Const.imagealign_InlineDown:
                alignment = 'inlinedown';
                break;
            case Const.imagealign_InlineCenter:
                alignment = 'inlinecenter';
                break;
            case Const.imagealign_MarginLeft:
                alignment = 'marginleft';
                break;
            case Const.imagealign_MarginRight:
                alignment = 'marginright';
                break;
        }
        img.alignment = alignment;
        if (win.hyperlink)
            img.hyperlink = win.hyperlink;
        gli_window_buffer_put_special(win, img);
        return 1;

    case Const.wintype_Graphics:
        img.x = val1;
        img.y = val2;
        /* width, height already set */
        win.content.push(img);
        return 1;
    }

    return 0;
}

function glk_window_flow_break(win) {
    if (!win)
        throw('glk_window_flow_break: invalid window');

    if (win.type == Const.wintype_TextBuffer)
        gli_window_buffer_put_special(win, undefined, true);
}

function glk_window_erase_rect(win, left, top, width, height) {
    if (!win)
        throw('glk_window_erase_rect: invalid window');
    if (win.type != Const.wintype_Graphics)
        throw('glk_window_erase_rect: not a graphics window');

    win.content.push({ special:'fill', x:left, y:top, width:width, height:height });
}

function glk_window_fill_rect(win, color, left, top, width, height) {
    if (!win)
        throw('glk_window_fill_rect: invalid window');
    if (win.type != Const.wintype_Graphics)
        throw('glk_window_fill_rect: not a graphics window');

    var colstr = gli_color_to_css(color);
    win.content.push({ special:'fill', color:colstr, x:left, y:top, width:width, height:height });
}

function glk_window_set_background_color(win, color) {
    if (!win)
        throw('glk_window_set_background_color: invalid window');
    if (win.type != Const.wintype_Graphics)
        throw('glk_window_set_background_color: not a graphics window');

    var colstr = gli_color_to_css(color);
    win.content.push({ special:'setcolor', color:colstr });
}

/* Convert a Glk numeric color value to a CSS-compatible string.
*/
function gli_color_to_css(color) {
    var res = (color & 0xFFFFFF).toString(16);
    while (res.length < 6) {
        res = '0' + res;
    }
    return '#' + res.toUpperCase();
}

function glk_schannel_iterate(schan, rockref) {
    if (!schan)
        schan = gli_schannellist;
    else
        schan = schan.next;

    if (schan) {
        if (rockref)
            rockref.set_value(schan.rock);
        return schan;
    }

    if (rockref)
        rockref.set_value(0);
    return null;
}

function glk_schannel_get_rock(schan) {
    if (!schan)
        throw('glk_schannel_get_rock: invalid schannel');
    return schan.rock;
}

function glk_schannel_create(rock) {
    return null;
}

function glk_schannel_destroy(schan) {
    throw('glk_schannel_destroy: invalid schannel');
}

function glk_schannel_play(schan, sndid) {
    throw('glk_schannel_play: invalid schannel');
}

function glk_schannel_play_ext(schan, sndid, repeats, notify) {
    throw('glk_schannel_play_ext: invalid schannel');
}

function glk_schannel_stop(schan) {
    throw('glk_schannel_stop: invalid schannel');
}

function glk_schannel_set_volume(schan, vol) {
    throw('glk_schannel_set_volume: invalid schannel');
}

function glk_sound_load_hint(sndid, flag) {
}

function glk_schannel_create_ext(rock, vol) {
    return null;
}

function glk_schannel_play_multi(schans, sndids, notify) {
    throw('glk_schannel_play_multi: invalid schannel');
}

function glk_schannel_pause(schan) {
    throw('glk_schannel_pause: invalid schannel');
}

function glk_schannel_unpause(schan) {
    throw('glk_schannel_unpause: invalid schannel');
}

function glk_schannel_set_volume_ext(schan, vol, duration, notify) {
    throw('glk_schannel_set_volume_ext: invalid schannel');
}

function glk_set_hyperlink(val) {
    gli_set_hyperlink(gli_currentstr, val);
}

function glk_set_hyperlink_stream(str, val) {
    gli_set_hyperlink(str, val);
}

function glk_request_hyperlink_event(win) {
    if (!win)
        throw('glk_request_hyperlink_event: invalid window');
    if (win.type == Const.wintype_TextBuffer 
        || win.type == Const.wintype_TextGrid) {
        win.hyperlink_request = true;
    }
}

function glk_cancel_hyperlink_event(win) {
    if (!win)
        throw('glk_cancel_hyperlink_event: invalid window');
    if (win.type == Const.wintype_TextBuffer 
        || win.type == Const.wintype_TextGrid) {
        win.hyperlink_request = false;
    }
}

function glk_buffer_to_lower_case_uni(arr, numchars) {
    var ix, jx, pos, val, origval;
    var arrlen = arr.length;
    var src = arr.slice(0, numchars);

    if (arrlen < numchars)
        throw('buffer_to_lower_case_uni: numchars exceeds array length');

    pos = 0;
    for (ix=0; ix<numchars; ix++) {
        origval = src[ix];
        val = unicode_lower_table[origval];
        if (val === undefined) {
            arr[pos] = origval;
            pos++;
        }
        else if (!(val instanceof Array)) {
            arr[pos] = val;
            pos++;
        }
        else {
            for (jx=0; jx<val.length; jx++) {
                arr[pos] = val[jx];
                pos++;
            }
        }
    }

    /* in case we stretched the array */
    arr.length = arrlen;

    return pos;
}

function glk_buffer_to_upper_case_uni(arr, numchars) {
    var ix, jx, pos, val, origval;
    var arrlen = arr.length;
    var src = arr.slice(0, numchars);

    if (arrlen < numchars)
        throw('buffer_to_upper_case_uni: numchars exceeds array length');

    pos = 0;
    for (ix=0; ix<numchars; ix++) {
        origval = src[ix];
        val = unicode_upper_table[origval];
        if (val === undefined) {
            arr[pos] = origval;
            pos++;
        }
        else if (!(val instanceof Array)) {
            arr[pos] = val;
            pos++;
        }
        else {
            for (jx=0; jx<val.length; jx++) {
                arr[pos] = val[jx];
                pos++;
            }
        }
    }

    /* in case we stretched the array */
    arr.length = arrlen;

    return pos;
}

function glk_buffer_to_title_case_uni(arr, numchars, lowerrest) {
    var ix, jx, pos, val, origval;
    var arrlen = arr.length;
    var src = arr.slice(0, numchars);

    if (arrlen < numchars)
        throw('buffer_to_title_case_uni: numchars exceeds array length');

    pos = 0;

    if (numchars == 0)
        return 0;

    ix = 0;
    {
        origval = src[ix];
        val = unicode_title_table[origval];
        if (val === undefined) {
            val = unicode_upper_table[origval];
        }
        if (val === undefined) {
            arr[pos] = origval;
            pos++;
        }
        else if (!(val instanceof Array)) {
            arr[pos] = val;
            pos++;
        }
        else {
            for (jx=0; jx<val.length; jx++) {
                arr[pos] = val[jx];
                pos++;
            }
        }
    }
    
    if (!lowerrest) {
        for (ix=1; ix<numchars; ix++) {
            origval = src[ix];
            arr[pos] = origval;
            pos++;
        }
    }
    else {
        for (ix=1; ix<numchars; ix++) {
            origval = src[ix];
            val = unicode_lower_table[origval];
            if (val === undefined) {
                arr[pos] = origval;
                pos++;
            }
            else if (!(val instanceof Array)) {
                arr[pos] = val;
                pos++;
            }
            else {
                for (jx=0; jx<val.length; jx++) {
                    arr[pos] = val[jx];
                    pos++;
                }
            }
        }
    }

    /* in case we stretched the array */
    arr.length = arrlen;

    return pos;
}

function gli_buffer_canon_decompose_uni(arr, numchars) {
    /* This is a utility function to decompose an array. The behavior is
       almost the same as glk_buffer_canon_decompose_uni(), except that
       this *doesn't* trim the array down to its original length. That
       is, this decomposition can cause the array to grow. */

    /* The algorithm for the canonical decomposition of a string: For
       each character, look up the decomposition in the decomp table.
       Append the decomposition to the buffer. Finally, sort every
       substring of the buffer which is made up of combining
       characters (characters with a nonzero combining class). */

    var src = arr.slice(0, numchars);
    var pos, ix, jx, origval, val;
    var grpstart, grpend, kx, tmp;

    pos = 0;
    for (ix=0; ix<numchars; ix++) {
        origval = src[ix];
        val = unicode_decomp_table[origval];
        if (val === undefined) {
            arr[pos] = origval;
            pos++;
        }
        else if (!(val instanceof Array)) {
            arr[pos] = val;
            pos++;
        }
        else {
            for (jx=0; jx<val.length; jx++) {
                arr[pos] = val[jx];
                pos++;
            }
        }
    }

    /* Now we sort groups of combining characters. This should be a
       stable sort by the combining-class number. We're lazy and
       nearly all groups are short, so we'll just bubble-sort. */
    ix = 0;
    while (ix < pos) {
        if (!unicode_combin_table[arr[ix]]) {
            ix++;
            continue;
        }
        if (ix >= pos)
            break;
        grpstart = ix;
        while (ix < pos && unicode_combin_table[arr[ix]]) 
            ix++;
        grpend = ix;
        if (grpend - grpstart >= 2) {
            /* Sort this group. */
            for (jx = grpend-1; jx > grpstart; jx--) {
                for (kx = grpstart; kx < jx; kx++) {
                    if (unicode_combin_table[arr[kx]] > unicode_combin_table[arr[kx+1]]) {
                        tmp = arr[kx];
                        arr[kx] = arr[kx+1];
                        arr[kx+1] = tmp;
                    }
                }
            }
        }
    }

    return pos;
}

function gli_buffer_canon_compose_uni(arr, numchars) {
    /* The algorithm for canonically composing characters in a string:
       for each base character, compare it to all the following
       combining characters (up to the next base character). If they're 
       composable, compose them. Repeat until no more pairs are found. */

    var ix, jx, curch, newch, curclass, newclass, map, pos;

    if (numchars == 0)
        return 0;

    pos = 0;
    curch = arr[0];
    curclass = unicode_combin_table[curch];
    if (curclass)
        curclass = 999; // just in case the first character is a combiner
    ix = 1;
    jx = ix;
    while (true) {
        if (jx >= numchars) {
            arr[pos] = curch;
            pos = ix;
            break;
        }
        newch = arr[jx];
        newclass = unicode_combin_table[newch];
        map = unicode_compo_table[curch];
        if (map !== undefined && map[newch] !== undefined
            && (!curclass || (newclass && curclass < newclass))) {
            curch = map[newch];
            arr[pos] = curch;
        }
        else {
            if (!newclass) {
                pos = ix;
                curch = newch;
            }
            curclass = newclass;
            arr[ix] = newch;
            ix++;
        }
        jx++;
    }

    return pos;
}

function glk_buffer_canon_decompose_uni(arr, numchars) {
    var arrlen = arr.length;
    var len;

    len = gli_buffer_canon_decompose_uni(arr, numchars);

    /* in case we stretched the array */
    arr.length = arrlen;

    return len;
}

function glk_buffer_canon_normalize_uni(arr, numchars) {
    var arrlen = arr.length;
    var len;

    len = gli_buffer_canon_decompose_uni(arr, numchars);
    len = gli_buffer_canon_compose_uni(arr, len);

    /* in case we stretched the array */
    arr.length = arrlen;

    return len;
}

function glk_put_char_uni(ch) {
    gli_put_char(gli_currentstr, ch);
}

function glk_put_string_uni(val) {
    glk_put_jstring_stream(gli_currentstr, val, false);
}

function glk_put_buffer_uni(arr) {
    gli_put_array(gli_currentstr, arr, false);
}

function glk_put_char_stream_uni(str, ch) {
    gli_put_char(str, ch);
}

function glk_put_string_stream_uni(str, val) {
    glk_put_jstring_stream(str, val, false);
}

function glk_put_buffer_stream_uni(str, arr) {
    gli_put_array(str, arr, false);
}

function glk_get_char_stream_uni(str) {
    if (!str)
        throw('glk_get_char_stream_uni: invalid stream');
    return gli_get_char(str, true);
}

function glk_get_buffer_stream_uni(str, buf) {
    if (!str)
        throw('glk_get_buffer_stream_uni: invalid stream');
    return gli_get_buffer(str, buf, true);
}

function glk_get_line_stream_uni(str, buf) {
    if (!str)
        throw('glk_get_line_stream_uni: invalid stream');
    return gli_get_line(str, buf, true);
}

function glk_stream_open_file_uni(fref, fmode, rock) {
    var Dialog = GlkOte.getlibrary('Dialog');
    
    if (!fref)
        throw('glk_stream_open_file_uni: invalid fileref');

    var str;
    var fstream;

    if (fmode != Const.filemode_Read 
        && fmode != Const.filemode_Write 
        && fmode != Const.filemode_ReadWrite 
        && fmode != Const.filemode_WriteAppend) 
        throw('glk_stream_open_file_uni: illegal filemode');

    if (fmode == Const.filemode_Read && !Dialog.file_ref_exists(fref.ref))
        return null;

    if (!Dialog.streaming) {
        var content = null;
        if (fmode != Const.filemode_Write) {
            content = Dialog.file_read(fref.ref);
        }
        if (content == null) {
            content = [];
            if (fmode != Const.filemode_Read) {
                /* We just created this file. (Or perhaps we're in Write mode
                   and we're truncating.) Write immediately, to create it and
                   get the creation date right. */
                Dialog.file_write(fref.ref, '', true);
            }
        }
        if (content.length == null) 
            throw('glk_stream_open_file_uni: data read had no length');
    }
    else {
        fstream = Dialog.file_fopen(fmode, fref.ref);
        if (!fstream)
            return null;
    }

    str = gli_new_stream(strtype_File, 
        (fmode != Const.filemode_Write), 
        (fmode != Const.filemode_Read), 
        rock);
    str.unicode = true;
    str.isbinary = !fref.textmode;
    str.ref = fref.ref;
    str.origfmode = fmode;

    if (!Dialog.streaming) {
        str.streaming = false;
        str.buf = content;
        str.buflen = 0xFFFFFFFF; /* enormous */
        if (fmode == Const.filemode_Write)
            str.bufeof = 0;
        else
            str.bufeof = content.length;
        if (fmode == Const.filemode_WriteAppend)
            str.bufpos = str.bufeof;
        else
            str.bufpos = 0;
    }
    else {
        str.streaming = true;
        str.fstream = fstream;
        /* We'll want a Buffer object around for short and writes. */
        str.buffer4 = fstream.BufferClass.alloc(4);
    }

    return str;
}

function glk_stream_open_memory_uni(buf, fmode, rock) {
    var str;

    if (fmode != Const.filemode_Read 
        && fmode != Const.filemode_Write 
        && fmode != Const.filemode_ReadWrite) 
        throw('glk_stream_open_memory: illegal filemode');

    str = gli_new_stream(strtype_Memory, 
        (fmode != Const.filemode_Write), 
        (fmode != Const.filemode_Read), 
        rock);
    str.unicode = true;

    if (buf) {
        str.buf = buf;
        str.buflen = buf.length;
        str.bufpos = 0;
        if (fmode == Const.filemode_Write)
            str.bufeof = 0;
        else
            str.bufeof = str.buflen;
        if (GiDispa)
            GiDispa.retain_array(buf);
    }

    return str;
}

function glk_request_char_event_uni(win) {
    if (!win)
        throw('glk_request_char_event: invalid window');
    if (win.char_request || win.line_request)
        throw('glk_request_char_event: window already has keyboard request');

    if (win.type == Const.wintype_TextBuffer 
        || win.type == Const.wintype_TextGrid) {
        win.char_request = true;
        win.char_request_uni = true;
        win.input_generation = event_generation;
    }
    else {
        /* ### wintype_Graphics could accept char input if we set up the focus to allow it. See gestalt_GraphicsCharInput. */
        throw('glk_request_char_event: window does not support keyboard input');
    }
}

function glk_request_line_event_uni(win, buf, initlen) {
    if (!win)
        throw('glk_request_line_event: invalid window');
    if (win.char_request || win.line_request)
        throw('glk_request_line_event: window already has keyboard request');

    if (win.type == Const.wintype_TextBuffer 
        || win.type == Const.wintype_TextGrid) {
        if (initlen) {
            /* This will be copied into the next update. */
            var ls = buf.slice(0, initlen);
            if (!current_partial_outputs)
                current_partial_outputs = {};
            current_partial_outputs[win.disprock] = UniArrayToString(ls);
        }
        win.line_request = true;
        win.line_request_uni = true;
        if (win.type == Const.wintype_TextBuffer)
            win.request_echo_line_input = win.echo_line_input;
        else
            win.request_echo_line_input = true;
        win.input_generation = event_generation;
        win.linebuf = buf;
        if (GiDispa)
            GiDispa.retain_array(buf);
    }
    else {
        throw('glk_request_line_event: window does not support keyboard input');
    }
}

function glk_current_time(timevalref) {
    var now = new Date().getTime();
    var usec;

    timevalref.set_field(0, Math.floor(now / 4294967296000));
    timevalref.set_field(1, Math.floor(now / 1000) >>>0);
    usec = Math.floor((now % 1000) * 1000);
    if (usec < 0)
        usec = 1000000 + usec;
    timevalref.set_field(2, usec);
}

function glk_current_simple_time(factor) {
    var now = new Date().getTime();
    return Math.floor(now / (factor * 1000));
}

function glk_time_to_date_utc(timevalref, dateref) {
    var now = timevalref.get_field(0) * 4294967296000 + timevalref.get_field(1) * 1000 + timevalref.get_field(2) / 1000;
    var obj = new Date(now);
    
    dateref.set_field(0, obj.getUTCFullYear())
    dateref.set_field(1, 1+obj.getUTCMonth())
    dateref.set_field(2, obj.getUTCDate())
    dateref.set_field(3, obj.getUTCDay())
    dateref.set_field(4, obj.getUTCHours())
    dateref.set_field(5, obj.getUTCMinutes())
    dateref.set_field(6, obj.getUTCSeconds())
    dateref.set_field(7, 1000*obj.getUTCMilliseconds())
}

function glk_time_to_date_local(timevalref, dateref) {
    var now = timevalref.get_field(0) * 4294967296000 + timevalref.get_field(1) * 1000 + timevalref.get_field(2) / 1000;
    var obj = new Date(now);
    
    dateref.set_field(0, obj.getFullYear())
    dateref.set_field(1, 1+obj.getMonth())
    dateref.set_field(2, obj.getDate())
    dateref.set_field(3, obj.getDay())
    dateref.set_field(4, obj.getHours())
    dateref.set_field(5, obj.getMinutes())
    dateref.set_field(6, obj.getSeconds())
    dateref.set_field(7, 1000*obj.getMilliseconds())
}

function glk_simple_time_to_date_utc(time, factor, dateref) {
    var now = time*(1000*factor);
    var obj = new Date(now);
    
    dateref.set_field(0, obj.getUTCFullYear())
    dateref.set_field(1, 1+obj.getUTCMonth())
    dateref.set_field(2, obj.getUTCDate())
    dateref.set_field(3, obj.getUTCDay())
    dateref.set_field(4, obj.getUTCHours())
    dateref.set_field(5, obj.getUTCMinutes())
    dateref.set_field(6, obj.getUTCSeconds())
    dateref.set_field(7, 1000*obj.getUTCMilliseconds())
}

function glk_simple_time_to_date_local(time, factor, dateref) {
    var now = time*(1000*factor);
    var obj = new Date(now);
    
    dateref.set_field(0, obj.getFullYear())
    dateref.set_field(1, 1+obj.getMonth())
    dateref.set_field(2, obj.getDate())
    dateref.set_field(3, obj.getDay())
    dateref.set_field(4, obj.getHours())
    dateref.set_field(5, obj.getMinutes())
    dateref.set_field(6, obj.getSeconds())
    dateref.set_field(7, 1000*obj.getMilliseconds())
}

function glk_date_to_time_utc(dateref, timevalref) {
    var obj = new Date(0);

    obj.setUTCFullYear(dateref.get_field(0));
    obj.setUTCMonth(dateref.get_field(1)-1);
    obj.setUTCDate(dateref.get_field(2));
    obj.setUTCHours(dateref.get_field(4));
    obj.setUTCMinutes(dateref.get_field(5));
    obj.setUTCSeconds(dateref.get_field(6));
    obj.setUTCMilliseconds(dateref.get_field(7)/1000);

    var now = obj.getTime();
    var usec;

    timevalref.set_field(0, Math.floor(now / 4294967296000));
    timevalref.set_field(1, Math.floor(now / 1000) >>>0);
    usec = Math.floor((now % 1000) * 1000);
    if (usec < 0)
        usec = 1000000 + usec;
    timevalref.set_field(2, usec);
}

function glk_date_to_time_local(dateref, timevalref) {
    var obj = new Date(
        dateref.get_field(0), dateref.get_field(1)-1, dateref.get_field(2),
        dateref.get_field(4), dateref.get_field(5), dateref.get_field(6), 
        dateref.get_field(7)/1000);

    var now = obj.getTime();
    var usec;

    timevalref.set_field(0, Math.floor(now / 4294967296000));
    timevalref.set_field(1, Math.floor(now / 1000) >>>0);
    usec = Math.floor((now % 1000) * 1000);
    if (usec < 0)
        usec = 1000000 + usec;
    timevalref.set_field(2, usec);
}

function glk_date_to_simple_time_utc(dateref, factor) {
    var obj = new Date(0);

    obj.setUTCFullYear(dateref.get_field(0));
    obj.setUTCMonth(dateref.get_field(1)-1);
    obj.setUTCDate(dateref.get_field(2));
    obj.setUTCHours(dateref.get_field(4));
    obj.setUTCMinutes(dateref.get_field(5));
    obj.setUTCSeconds(dateref.get_field(6));
    obj.setUTCMilliseconds(dateref.get_field(7)/1000);

    var now = obj.getTime();
    return Math.floor(now / (factor * 1000));
}

function glk_date_to_simple_time_local(dateref, factor) {
    var obj = new Date(
        dateref.get_field(0), dateref.get_field(1)-1, dateref.get_field(2),
        dateref.get_field(4), dateref.get_field(5), dateref.get_field(6), 
        dateref.get_field(7)/1000);

    var now = obj.getTime();
    return Math.floor(now / (factor * 1000));
}

/* End of Glk namespace function. Return the object which will
   become the Glk global. */
return {
    classname: 'Glk',
    version: '2.3.7', /* GlkOte/GlkApi version */
    init : init,
    inited : is_inited,
    update : update,
    getlibrary : get_library,
    save_allstate : save_allstate,
    restore_allstate : restore_allstate,
    fatal_error : fatal_error,

    byte_array_to_string : ByteArrayToString,
    uni_array_to_string : UniArrayToString,
    Const : Const,
    RefBox : RefBox,
    RefStruct : RefStruct,
    DidNotReturn : DidNotReturn,
    call_may_not_return : call_may_not_return,

    glk_put_jstring : glk_put_jstring,
    glk_put_jstring_stream : glk_put_jstring_stream,

    glk_exit : glk_exit,
    glk_tick : glk_tick,
    glk_gestalt : glk_gestalt,
    glk_gestalt_ext : glk_gestalt_ext,
    glk_window_iterate : glk_window_iterate,
    glk_window_get_rock : glk_window_get_rock,
    glk_window_get_root : glk_window_get_root,
    glk_window_open : glk_window_open,
    glk_window_close : glk_window_close,
    glk_window_get_size : glk_window_get_size,
    glk_window_set_arrangement : glk_window_set_arrangement,
    glk_window_get_arrangement : glk_window_get_arrangement,
    glk_window_get_type : glk_window_get_type,
    glk_window_get_parent : glk_window_get_parent,
    glk_window_clear : glk_window_clear,
    glk_window_move_cursor : glk_window_move_cursor,
    glk_window_get_stream : glk_window_get_stream,
    glk_window_set_echo_stream : glk_window_set_echo_stream,
    glk_window_get_echo_stream : glk_window_get_echo_stream,
    glk_set_window : glk_set_window,
    glk_window_get_sibling : glk_window_get_sibling,
    glk_stream_iterate : glk_stream_iterate,
    glk_stream_get_rock : glk_stream_get_rock,
    glk_stream_open_file : glk_stream_open_file,
    glk_stream_open_memory : glk_stream_open_memory,
    glk_stream_close : glk_stream_close,
    glk_stream_set_position : glk_stream_set_position,
    glk_stream_get_position : glk_stream_get_position,
    glk_stream_set_current : glk_stream_set_current,
    glk_stream_get_current : glk_stream_get_current,
    glk_fileref_create_temp : glk_fileref_create_temp,
    glk_fileref_create_by_name : glk_fileref_create_by_name,
    glk_fileref_create_by_prompt : glk_fileref_create_by_prompt,
    glk_fileref_destroy : glk_fileref_destroy,
    glk_fileref_iterate : glk_fileref_iterate,
    glk_fileref_get_rock : glk_fileref_get_rock,
    glk_fileref_delete_file : glk_fileref_delete_file,
    glk_fileref_does_file_exist : glk_fileref_does_file_exist,
    glk_fileref_create_from_fileref : glk_fileref_create_from_fileref,
    glk_put_char : glk_put_char,
    glk_put_char_stream : glk_put_char_stream,
    glk_put_string : glk_put_string,
    glk_put_string_stream : glk_put_string_stream,
    glk_put_buffer : glk_put_buffer,
    glk_put_buffer_stream : glk_put_buffer_stream,
    glk_set_style : glk_set_style,
    glk_set_style_stream : glk_set_style_stream,
    glk_get_char_stream : glk_get_char_stream,
    glk_get_line_stream : glk_get_line_stream,
    glk_get_buffer_stream : glk_get_buffer_stream,
    glk_char_to_lower : glk_char_to_lower,
    glk_char_to_upper : glk_char_to_upper,
    glk_stylehint_set : glk_stylehint_set,
    glk_stylehint_clear : glk_stylehint_clear,
    glk_style_distinguish : glk_style_distinguish,
    glk_style_measure : glk_style_measure,
    glk_select : glk_select,
    glk_select_poll : glk_select_poll,
    glk_request_line_event : glk_request_line_event,
    glk_cancel_line_event : glk_cancel_line_event,
    glk_request_char_event : glk_request_char_event,
    glk_cancel_char_event : glk_cancel_char_event,
    glk_request_mouse_event : glk_request_mouse_event,
    glk_cancel_mouse_event : glk_cancel_mouse_event,
    glk_request_timer_events : glk_request_timer_events,
    glk_image_get_info : glk_image_get_info,
    glk_image_draw : glk_image_draw,
    glk_image_draw_scaled : glk_image_draw_scaled,
    glk_image_draw_scaled_ext : glk_image_draw_scaled_ext,
    glk_window_flow_break : glk_window_flow_break,
    glk_window_erase_rect : glk_window_erase_rect,
    glk_window_fill_rect : glk_window_fill_rect,
    glk_window_set_background_color : glk_window_set_background_color,
    glk_schannel_iterate : glk_schannel_iterate,
    glk_schannel_get_rock : glk_schannel_get_rock,
    glk_schannel_create : glk_schannel_create,
    glk_schannel_destroy : glk_schannel_destroy,
    glk_schannel_play : glk_schannel_play,
    glk_schannel_play_ext : glk_schannel_play_ext,
    glk_schannel_stop : glk_schannel_stop,
    glk_schannel_set_volume : glk_schannel_set_volume,
    glk_schannel_create_ext : glk_schannel_create_ext,
    glk_schannel_play_multi : glk_schannel_play_multi,
    glk_schannel_pause : glk_schannel_pause,
    glk_schannel_unpause : glk_schannel_unpause,
    glk_schannel_set_volume_ext : glk_schannel_set_volume_ext,
    glk_sound_load_hint : glk_sound_load_hint,
    glk_set_hyperlink : glk_set_hyperlink,
    glk_set_hyperlink_stream : glk_set_hyperlink_stream,
    glk_request_hyperlink_event : glk_request_hyperlink_event,
    glk_cancel_hyperlink_event : glk_cancel_hyperlink_event,
    glk_buffer_to_lower_case_uni : glk_buffer_to_lower_case_uni,
    glk_buffer_to_upper_case_uni : glk_buffer_to_upper_case_uni,
    glk_buffer_to_title_case_uni : glk_buffer_to_title_case_uni,
    glk_buffer_canon_decompose_uni : glk_buffer_canon_decompose_uni,
    glk_buffer_canon_normalize_uni : glk_buffer_canon_normalize_uni,
    glk_put_char_uni : glk_put_char_uni,
    glk_put_string_uni : glk_put_string_uni,
    glk_put_buffer_uni : glk_put_buffer_uni,
    glk_put_char_stream_uni : glk_put_char_stream_uni,
    glk_put_string_stream_uni : glk_put_string_stream_uni,
    glk_put_buffer_stream_uni : glk_put_buffer_stream_uni,
    glk_get_char_stream_uni : glk_get_char_stream_uni,
    glk_get_buffer_stream_uni : glk_get_buffer_stream_uni,
    glk_get_line_stream_uni : glk_get_line_stream_uni,
    glk_stream_open_file_uni : glk_stream_open_file_uni,
    glk_stream_open_memory_uni : glk_stream_open_memory_uni,
    glk_request_char_event_uni : glk_request_char_event_uni,
    glk_request_line_event_uni : glk_request_line_event_uni,
    glk_set_echo_line_event : glk_set_echo_line_event,
    glk_set_terminators_line_event : glk_set_terminators_line_event,
    glk_current_time : glk_current_time,
    glk_current_simple_time : glk_current_simple_time,
    glk_time_to_date_utc : glk_time_to_date_utc,
    glk_time_to_date_local : glk_time_to_date_local,
    glk_simple_time_to_date_utc : glk_simple_time_to_date_utc,
    glk_simple_time_to_date_local : glk_simple_time_to_date_local,
    glk_date_to_time_utc : glk_date_to_time_utc,
    glk_date_to_time_local : glk_date_to_time_local,
    glk_date_to_simple_time_utc : glk_date_to_simple_time_utc,
    glk_date_to_simple_time_local : glk_date_to_simple_time_local,
    glk_stream_open_resource : glk_stream_open_resource,
    glk_stream_open_resource_uni : glk_stream_open_resource_uni
};

};

/* Glk is an instance of GlkClass, ready to init. */
var Glk = new GlkClass();

// Node-compatible behavior
try { exports.Glk = Glk; exports.GlkClass = GlkClass; } catch (ex) {};

/* End of Glk library. */
