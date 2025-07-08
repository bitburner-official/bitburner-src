const colors = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
};

export const TerminalHelpText: string[] = [
  "Type 'help name' to learn more about the command ",
  " ",
  colors.green +
    "    alias" +
    colors.yellow +
    ' [-g] [name="value"]        ' +
    colors.reset +
    "Create or display Terminal aliases",
  colors.green +
    "    analyze" +
    colors.yellow +
    "                          " +
    colors.reset +
    "Get information about the current machine ",
  colors.green +
    "    backdoor" +
    colors.yellow +
    "                         " +
    colors.reset +
    "Install a backdoor on the current machine ",
  colors.green +
    "    buy" +
    colors.yellow +
    " [-l/-a/program]              " +
    colors.reset +
    "Purchase a program through the Dark Web",
  colors.green +
    "    cat" +
    colors.yellow +
    " [file]                       " +
    colors.reset +
    "Display a .msg, .lit, or .txt file",
  colors.green +
    "    cd" +
    colors.yellow +
    " [dir]                         " +
    colors.reset +
    "Change to a new directory",
  colors.green + "    changelog" + colors.yellow + "                        " + colors.reset + "Display changelog",
  colors.green +
    "    check" +
    colors.yellow +
    " [script] [args...]         " +
    colors.reset +
    "Print a script's logs to Terminal",
  colors.green +
    "    clear" +
    colors.yellow +
    "                            " +
    colors.reset +
    "Clear all text on the terminal ",
  colors.green + "    cls" + colors.yellow + "                              " + colors.reset + "See 'clear' command ",
  colors.green +
    "    connect" +
    colors.yellow +
    " [hostname]               " +
    colors.reset +
    "Connects to a remote server",
  colors.green + "    cp" + colors.yellow + " [src] [dest]                  " + colors.reset + "Copy a file",
  colors.green +
    "    download" +
    colors.yellow +
    " [script/text file]      " +
    colors.reset +
    "Downloads scripts or text files to your computer",
  colors.green +
    "    expr" +
    colors.yellow +
    " [math expression]           " +
    colors.reset +
    "Evaluate a mathematical expression",
  colors.green +
    "    free" +
    colors.yellow +
    "                             " +
    colors.reset +
    "Check the machine's memory (RAM) usage",
  colors.green +
    "    grep" +
    colors.yellow +
    " [opts]... pattern [file]... " +
    colors.reset +
    "Search for PATTERN (string/regular expression) in each FILE and print results to terminal",
  colors.yellow + "         [-O] [target file]" + colors.reset,
  colors.green +
    "    grow" +
    colors.yellow +
    "                             " +
    colors.reset +
    "Spoof money in a servers bank account, increasing the amount available.",
  colors.green +
    "    hack" +
    colors.yellow +
    "                             " +
    colors.reset +
    "Hack the current machine",
  colors.green +
    "    help" +
    colors.yellow +
    " [command]                   " +
    colors.reset +
    "Display this help text, or the help text for a command",
  colors.green +
    "    history" +
    colors.yellow +
    " [-c]                     " +
    colors.reset +
    "Display the terminal history",
  colors.green +
    "    home" +
    colors.yellow +
    "                             " +
    colors.reset +
    "Connect to home computer",
  colors.green +
    "    hostname" +
    colors.yellow +
    "                         " +
    colors.reset +
    "Displays the hostname of the machine",
  colors.green +
    "    ipaddr" +
    colors.yellow +
    "                           " +
    colors.reset +
    "Displays the IP address of the machine",
  colors.green +
    "    kill" +
    colors.yellow +
    " [script/pid] [args...]      " +
    colors.reset +
    "Stops the specified script on the current server ",
  colors.green +
    "    killall" +
    colors.yellow +
    "                          " +
    colors.reset +
    "Stops all running scripts on the current machine",
  colors.green +
    "    ls" +
    colors.yellow +
    " [dir] [-l] [-h] [-g pattern]  " +
    colors.reset +
    "Displays all files on the machine",
  colors.green +
    "    lscpu" +
    colors.yellow +
    "                            " +
    colors.reset +
    "Displays the number of CPU cores on the machine",
  colors.green +
    "    mem" +
    colors.yellow +
    " [script] [-t n]              " +
    colors.reset +
    "Displays the amount of RAM required to run the script",
  colors.green +
    "    mv" +
    colors.yellow +
    " [src] [dest]                  " +
    colors.reset +
    "Move/rename a text or script file",
  colors.green +
    "    nano" +
    colors.yellow +
    " [files...]                  " +
    colors.reset +
    "Text editor - Open up and edit one or more scripts or text files",
  colors.green +
    "    ps" +
    colors.yellow +
    "                               " +
    colors.reset +
    "Display all scripts that are currently running",
  colors.green +
    "    rm" +
    colors.yellow +
    " [OPTIONS]... [FILE]...        " +
    colors.reset +
    "Delete a file from the server",
  colors.green +
    "    run" +
    colors.yellow +
    " [script] [-t n] [--tail]     " +
    colors.reset +
    "Execute a program or script",
  colors.yellow + "        [--ram-override n] [args...]" + colors.reset,
  colors.green +
    "    scan" +
    colors.yellow +
    "                             " +
    colors.reset +
    "Prints all immediately-available network connections",
  colors.green +
    "    scan-analyze" +
    colors.yellow +
    " [d] [-a]            " +
    colors.reset +
    "Prints info for all servers up to d nodes away",
  colors.green +
    "    scp" +
    colors.yellow +
    " [files...] [server]          " +
    colors.reset +
    "Copies a file to a destination server",
  colors.green +
    "    sudov" +
    colors.yellow +
    "                            " +
    colors.reset +
    "Shows whether you have root access on this computer",
  colors.green +
    "    tail" +
    colors.yellow +
    " [script/pid] [args...]      " +
    colors.reset +
    "Displays dynamic logs for the specified script",
  colors.green +
    "    top" +
    colors.yellow +
    "                              " +
    colors.reset +
    "Displays all running scripts and their RAM usage",
  colors.green +
    "    unalias" +
    colors.yellow +
    " [alias name]             " +
    colors.reset +
    "Deletes the specified alias",
  colors.green +
    "    vim" +
    colors.yellow +
    " [files...]                   " +
    colors.reset +
    "Text editor - Open up and edit one or more scripts or text files in vim mode",
  colors.green +
    "    weaken" +
    colors.yellow +
    "                           " +
    colors.reset +
    "Reduce the security of the current machine",
  colors.green +
    "    wget" +
    colors.yellow +
    " [url] [target file]         " +
    colors.reset +
    "Retrieves code/text from a web server",
  " ",
];

const TemplatedHelpTexts: Record<string, (command: string) => string[]> = {
  scriptEditor: (command) => {
    return [
      `Usage: ${command} [file names...] | [glob]`,
      ` `,
      `Opens up the specified file(s) in the Script Editor. Only scripts (.js, .jsx, .ts, .tsx) `,
      `or text files (.txt, .json) can be edited using the Script Editor. If a file does not exist, a new `,
      `one will be created.`,
      ` `,
      `If a glob is provided as the only argument, ${command} can crawl directories and open all matching `,
      `files at once. ${command} cannot create files using globs, so your scripts must already exist.`,
      ` `,
      `Examples:`,
      ` `,
      `    ${command} test.js`,
      `    ${command} test.js test2.js`,
      ` `,
      `    ${command} test.*`,
      `    ${command} /my-dir/*.js`,
      ` `,
    ];
  },
};

export const HelpTexts: Record<string, string[]> = {
  alias: [
    colors.yellow + 'Usage: alias [-g] [name="value"] ',
    " ",
    "Create or display aliases. An alias enables a replacement of a word with another string. ",
    "It can be used to abbreviate a commonly used command, or commonly used parts of a command. The NAME ",
    "of an alias defines the word that will be replaced, while the VALUE defines what it will be replaced by. For example, ",
    "you could create the alias 'nuke' for the Terminal command 'run NUKE.exe' using the following: ",
    " ",
    '    alias nuke="run NUKE.exe"',
    " ",
    "Then, to run the NUKE.exe program you would just have to enter 'nuke' in Terminal rather than the full command. ",
    "It is important to note that 'default' aliases will only be substituted for the first word of a Terminal command. For ",
    "example, if the following alias was set: ",
    " ",
    '    alias worm="HTTPWorm.exe"',
    " ",
    "and then you tried to run the following terminal command: ",
    " ",
    "    run worm",
    " ",
    "This would fail because the worm alias is not the first word of a Terminal command. To allow an alias to be substituted ",
    "anywhere in a Terminal command, rather than just the first word, you must set it to be a global alias using the -g flag: ",
    " ",
    '    alias -g worm="HTTPWorm.exe"',
    " ",
    "Now, the 'worm' alias will be substituted anytime it shows up as an individual word in a Terminal command. ",
    " ",
    "Entering just the command 'alias' without any arguments prints the list of all defined aliases in the reusable form ",
    "'alias NAME=VALUE' on the Terminal. ",
    " ",
    "The 'unalias' command can be used to remove aliases.",
    "NOTE:  The --all alias is reserved for removal.",
    " ",
  ],
  analyze: [
    "Usage: analyze",
    " ",
    "Prints details and statistics about the current server. The information that is printed includes basic ",
    "server details such as the hostname, whether the player has root access, what ports are opened/closed, and also ",
    "hacking-related information such as an estimated chance to successfully hack, an estimate of how much money is ",
    "available on the server, etc.",
    " ",
  ],
  backdoor: [
    "Usage: backdoor",
    " ",
    "Install a backdoor on the current machine, grants a secret bonus depending on the machine.",
    " ",
    "Requires root access to run.",
    " ",
  ],
  buy: [
    "Usage: buy [-l / -a / program]",
    " ",
    "Purchase a program through the Dark Web. Requires a TOR router to use.",
    " ",
    "If this command is ran with the '-l' flag, it will display a list of all programs that can be bought through the ",
    "dark web to the Terminal, as well as their costs.",
    " ",
    "If this command is ran with the '-a' flag, it will attempt to purchase all unowned programs.",
    " ",
    "Otherwise, the name of the program must be passed in as a parameter. This name is NOT case-sensitive.",
    " ",
  ],
  cat: [
    "Usage: cat [file name]",
    " ",
    "Display message (.msg), literature (.lit), or text (.txt) files. Examples:",
    " ",
    "    cat j1.msg",
    " ",
    "    cat foo.lit",
    " ",
    "    cat servers.txt",
    " ",
  ],
  cd: [
    "Usage: cd [dir]",
    " ",
    "Change to the specified directory. You cannot change to a directory that does not exist. Examples:",
    " ",
    "    cd scripts/hacking",
    " ",
    "    cd /logs",
    " ",
    "    cd ../",
    " ",
  ],
  changelog: ["Usage: changelog", " ", "Display changelog.", " "],
  check: [
    "Usage: check [script name] [args...]",
    " ",
    "Print the logs of the script specified by the script name and arguments to the Terminal. Each argument must be separated by ",
    "a space. Remember that a running script is uniquely ",
    "identified both by its name and the arguments that are used to start it. So, if a script was ran with the following arguments: ",
    " ",
    "    run foo.js 1 2 foodnstuff",
    " ",
    "Then to run the 'check' command on this script you would have to pass the same arguments in: ",
    " ",
    "    check foo.js 1 2 foodnstuff",
    " ",
  ],
  clear: [
    "Usage: clear",
    " ",
    "Clear the Terminal screen, deleting all of the text. Note that this does not delete the user's command history, so using the up ",
    "and down arrow keys is still valid. Also note that this is permanent and there is no way to undo this. Synonymous with 'cls' command",
    " ",
  ],
  cls: [
    "Usage: cls",
    " ",
    "Clear the Terminal screen, deleting all of the text. Note that this does not delete the user's command history, so using the up ",
    "and down arrow keys is still valid. Also note that this is permanent and there is no way to undo this. Synonymous with 'clear' command",
    " ",
  ],
  connect: [
    "Usage: connect [hostname]",
    " ",
    "Connect to a remote server. The hostname of the remote server must be given as the argument ",
    "to this command. Note that only servers that are immediately adjacent to the current server in the network and the ones that have",
    "a backdoor installed can be connected to. To see which servers can be connected to, use the 'scan' command.",
    " ",
  ],
  cp: ["Usage: cp [src] [dest]", " ", "Copy a file on this server. To copy a file to another server use scp.", " "],
  download: [
    "Usage: download [script/text file]",
    " ",
    "Downloads a script or text file to your computer (like your real life computer).",
    " ",
    "You can also download all of your scripts/text files as a zip file using the following Terminal commands:",
    " ",
    "Download all scripts and text files: download *",
    " ",
    "Download all JS scripts: download *.js",
    " ",
    "Download all text files: download *.txt",
    " ",
  ],
  expr: [
    "Usage: expr [mathematical expression]",
    " ",
    "Evaluate a  simple mathematical expression. Supports native JavaScript operators:",
    " ",
    "+, -, /, *, **, %",
    " ",
    "Example:",
    " ",
    "    expr 25 * 2 ** 10",
    " ",
    "Note that letters (non-digits) are not allowed and will be removed from the input.",
    " ",
  ],
  free: [
    "Usage: free",
    " ",
    "Displays the memory usage on the current machine. Print the amount of RAM that is available on the current server as well as ",
    "how much of it is being used.",
    " ",
  ],
  grep: [
    "Usage: grep [OPTION]... PATTERN [FILE]... [-O] [OUTFILE] [-B/A/C] [NUM]",
    " ",
    "Search for PATTERN in each FILE and print results to terminal.",
    "Example: grep -n -h 'hello world' file1.js file2.txt -O output.txt -C 10 -V",
    " ",
    "OPTIONS: ",
    "  --help                   output this usage message and exit",
    " ",
    "Search control:",
    "  -* --search-all          search for PATTERN in each FILE on server. Ignores any FILE argument(s) passed",
    "  -p --pipe-terminal       search for PATTERN in terminal output. Ignores any FILE argument(s) passed",
    " ",
    "Pattern selection and interpretation:",
    "  -R, --regexp       PATTERN is basic regular expression. PATTERN is a string by default",
    " ",
    "Output control:",
    "  -m --max-count NUM       stop after NUM selected lines",
    "  -H --with-filename       print filename with output lines. Default when multiple FILE arguments passed",
    "  -h --no-filename         suppress printing file name with output lines. Default when one FILE argument passed. Overrides -H",
    "  -n --line-number         print line number with output lines",
    "  -q --quiet --silent      suppress printing to terminal",
    "  -O --output OUTFILE      pipe output to text file. The following argument must be a valid .txt or .json filename. Does NOT overwrite by default",
    "  -f --allow-overwrite     combine with [-O/--output] to allow overwriting provided output file",
    " ",
    "Context control:",
    "  -B --before-context NUM  print NUM lines of leading context",
    "  -A --after-context NUM   print NUM lines of trailing context",
    "  -C --context NUM         print NUM lines of output context",
    " ",
    "Miscellaneous:",
    "  -V --verbose             print PATTERN, count of matches and FILE(s) searched after regular output",
    "  -v --invert-match        select non-matching lines",
    " ",
    "Regular OPTIONs may be combined into one. Context, max-count and output OPTIONs must be separated. Example: grep test -VnH* -O output.txt -C 5",
    "By default PATTERN is interpreted as a simple string.",
    "At least one FILE argument must be passed, or pass -*/--search-all to search all files.",
    "The argument immediately following -m, -O and -B/A/C will be interpreted as the parameter for that OPTION.",
    'If encountering difficulties with argument parsing, consider explicitly passing a string as PATTERN. Example: grep -G "(complex|regexp|\\w+)" script.js',
    " ",
  ],
  grow: [
    "Usage: grow",
    " ",
    "Spoof transactions in the current server. Increasing the money available by hacking. Requires root access.",
    "See the wiki page for hacking mechanics.",
    " ",
  ],
  hack: [
    "Usage: hack",
    " ",
    "Attempt to hack the current server. Requires root access in order to be run. See the wiki page for hacking mechanics",
    " ",
  ],
  help: [
    "Usage: help [command]",
    " ",
    "Display Terminal help information. Without arguments, 'help' prints a list of all valid Terminal commands and a brief ",
    "description of their functionality. You can also pass the name of a Terminal command as an argument to 'help' to print ",
    "more detailed information about the Terminal command. Examples: ",
    " ",
    "    help alias",
    " ",
    "    help scan-analyze",
    " ",
  ],
  history: [
    "Usage: history [-c]",
    " ",
    "Without arguments, displays the terminal command history. To clear the history, pass in the '-c' argument.",
    " ",
  ],
  home: [
    "Usage: home",
    " ",
    "Connect to your home computer. This will work no matter what server you are currently connected to.",
    " ",
  ],
  hostname: ["Usage: hostname", " ", "Prints the hostname of the current server", " "],
  ipaddr: ["Usage: ipaddr", " ", "Prints the IP address of the current server", " "],
  kill: [
    "Usage: kill [script name] [args...] or kill [pid]",
    " ",
    "Kill the script specified by the script name and arguments OR by its PID.",
    " ",
    "If you are killing the script using its filename and arguments, then each ",
    "argument must be separated by a space. Remember that a running script is ",
    "uniquely identified by both its name and the arguments that are used to start ",
    "it. So, if a script was ran with the following arguments:",
    " ",
    "    run foo.js 1 sigma-cosmetics",
    " ",
    "Then to kill this script the same arguments would have to be used:",
    " ",
    "    kill foo.js 1 sigma-cosmetics",
    " ",
    "If you are killing the script using its PID, then the PID argument must be numeric",
    " ",
  ],
  killall: ["Usage: killall", " ", "Kills all scripts on the current server."],
  ls: [
    "Usage: ls [dir] [-l] [-h] [-g, --grep pattern]",
    " ",
    "The ls command, with no arguments, prints all files and directories on the current server's directory to the Terminal screen. ",
    "The files will be displayed in alphabetical order. ",
    " ",
    "The 'dir' optional parameter can be used to display files/directories in another directory.",
    " ",
    "The '-l' optional parameter allows you to force each item onto a single line, displaying two columns for the script's RAM usage and filesize.",
    " ",
    "The '-h' optional parameter allows you to display the filesize from '-l' in human readable format (e.g. KB, MB, GB) instead of bytes.",
    " ",
    "The '--grep pattern' optional parameter can be used to only display files whose filenames match the specified pattern.",
    " ",
    "Examples:",
    " ",
    "List all files with the '.js' extension in the current directory:",
    " ",
    "    ls -l --grep .js",
    " ",
    "List all files with the '.js' extension in the root directory:",
    " ",
    "    ls / -l --grep .js",
    " ",
    "List all files with the word 'purchase' in the filename, in the 'scripts' directory:",
    " ",
    "    ls scripts -l --grep purchase",
    " ",
  ],
  lscpu: ["Usage: lscpu", " ", "Prints the number of CPU Cores the current server has", " "],

  mem: [
    "Usage: mem [script name] [-t num_threads]",
    " ",
    "Displays the amount of RAM needed to run the specified script with a single thread. The command can also be used to print ",
    "the amount of RAM needed to run a script with multiple threads using the '-t' flag. If the '-t' flag is specified, then ",
    "an argument for the number of threads must be passed in afterwards. Examples:",
    " ",
    "    mem foo.js",
    " ",
    "    mem foo.js -t 50",
    " ",
    "The first example above will print the amount of RAM needed to run 'foo.js' with a single thread. The second example ",
    "above will print the amount of RAM needed to run 'foo.js' with 50 threads.",
    " ",
  ],
  mv: [
    "Usage: mv [src] [dest]",
    " ",
    "Move the source file to the specified destination. This can also be used to rename files. ",
    "This command only works for scripts and text files (.txt). This command CANNOT be used to ",
    "convert to different file types",
    " ",
    "Note that, unlike the Linux 'mv' command, the destination argument must be the ",
    "full filepath. ",
    "Examples: ",
    " ",
    "    mv hacking-controller.js scripts/hacking-controller.js",
    " ",
    "    mv myScript.js myOldScript.js",
    " ",
  ],
  nano: TemplatedHelpTexts.scriptEditor("nano"),
  ps: ["Usage: ps", " ", "Prints all scripts that are running on the current server", " "],
  rm: [
    "Usage: rm [OPTION]... [FILE]...",
    " ",
    "Remove the FILE(s).",
    " ",
    "-f, --force					Force removal of multiple files.",
    "-r, -R, --recursive	Remove directories and their contents recursively.",
    "--no-preserve-root		Do not treat '/' specially.",
    " ",
    "By default, rm does not operate on directories. To remove entire directories, use the --recursive (-r or -R) option.",
    " ",
    "To remove a file whose name starts with a '-', for example '-foo.js', use one of these commands:",
    "rm -- -foo.js",
    "rm ./-foo.js",
    " ",
    "Note that if you use rm to remove a file, the contents of the file will be lost. This is irreversible.",
  ],
  run: [
    "Usage: run [file name] [-t num_threads] [--tail] [--ram-override ram_in_GBs] [args...]",
    " ",
    "Execute a program, script or coding contract.",
    " ",
    "The '[-t num_threads]', '[--tail]', `[--ram-override ram_in_GBs]`, and '[args...]' arguments are only valid",
    "when running a script. The '-t' flag is used to indicate that the script should be run with the specified",
    "number of threads. If the flag is omitted, then the script will be run with a single thread by default. The",
    "'--tail' flag is used to immediately open a tail window for the script being ran. And the '--ram-override'",
    "flag is used to override the amount of ram (per thread) the script is ran with. If the script ends up using",
    "more than that amount of ram it will crash. If any of the flags are used, then they MUST come immediately",
    "after the script name.",
    " ",
    "[args...] represents a variable number of arguments that will be passed into the script. See the documentation ",
    "about script arguments. Each specified argument must be separated by a space. ",
    " ",
  ],
  scan: [
    "Usage: scan",
    " ",
    "Prints all immediately-available network connection. This will print a list of all servers that you can currently connect ",
    "to using the 'connect' Terminal command.",
    " ",
  ],
  "scan-analyze": [
    "Usage: scan-analyze [depth] [-a]",
    " ",
    "Prints detailed information about all servers up to [depth] nodes away on the network. Calling ",
    "'scan-analyze 1' will display information for the same servers that are shown by the 'scan' Terminal ",
    "command. This command also shows the relative paths to reach each server.",
    " ",
    "By default, the maximum depth that can be specified for 'scan-analyze' is 3. However, once you have ",
    "the DeepscanV1.exe and DeepscanV2.exe programs, you can execute 'scan-analyze' with a depth up to ",
    "5 and 10, respectively.",
    " ",
    "The information 'scan-analyze' displays about each server includes whether or not you have root access to it, ",
    "its required hacking level, the number of open ports required to run NUKE.exe on it, and how much RAM ",
    "it has.",
    " ",
    "By default, this command will not display servers that you have purchased. However, you can pass in the ",
    "-a flag at the end of the command if you would like to enable that.",
    " ",
  ],
  scp: [
    "Usage: scp [file names...] [target server]",
    " ",
    "Copies the specified file(s) from the current server to the target server. ",
    "This command only works for script files (.js, .jsx, .ts, .tsx), text files (.txt, .json), ",
    "and literature files (.lit).",
    "The second argument passed in must be the hostname or IP of the target server. Examples:",
    " ",
    "    scp foo.js n00dles",
    " ",
    "    scp foo.js bar.js n00dles",
    " ",
  ],
  sudov: ["Usage: sudov", " ", "Prints whether or not you have root access to the current machine", " "],

  tail: [
    "Usage: tail [script name] [args...]",
    " ",
    "Displays dynamic logs for the script specified by the script name and arguments. Each argument must be separated ",
    "by a space. Remember that a running script is uniquely identified by both its name and the arguments that were used ",
    "to run it. So, if a script was ran with the following arguments: ",
    " ",
    "    run foo.js 10 50000",
    " ",
    "Then in order to check its logs with 'tail' the same arguments must be used: ",
    " ",
    "    tail foo.js 10 50000",
    " ",
  ],
  top: [
    "Usage: top",
    " ",
    "Prints a list of all scripts running on the current server as well as their thread count and how much ",
    "RAM they are using in total.",
    " ",
  ],
  unalias: [
    "Usage: unalias [alias name]",
    "Usage: unalias -all",
    " ",
    "Deletes the specified alias. Note that the double quotation marks are required. ",
    "The --all command will remove ALL aliases that you have set.",
    " ",
    "As an example, if an alias was declared using:",
    " ",
    '    alias r="run"',
    " ",
    "Then it could be removed using:",
    " ",
    "    unalias r",
    " ",
    "It is not necessary to differentiate between global and non-global aliases when using 'unalias'",
    " ",
  ],
  vim: TemplatedHelpTexts.scriptEditor("vim"),
  weaken: [
    "Usage: weaken",
    " ",
    "Reduces the security level of the current server. Decreasing the time it takes for all operations on this server.",
    "Requires root access. See the wiki page for hacking mechanics.",
    " ",
  ],
  wget: [
    "Usage: wget [url] [target file]",
    " ",
    "Retrieves data from a URL and downloads it to a file on the current server. The data can only ",
    "be downloaded to a script (.js, .jsx, .ts, .tsx) or a text file (.txt, .json).",
    "If the file already exists, it will be overwritten by this command.",
    " ",
    "Note that it will not be possible to download data from many websites because they do not allow ",
    "cross-origin resource sharing (CORS). Example:",
    " ",
    "    wget https://raw.githubusercontent.com/bitburner-official/bitburner-src/master/README.md game_readme.txt",
    " ",
  ],
};
