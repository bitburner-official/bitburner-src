const e = " "; // empty
const c = "c"; // core
const b = "b"; // battery
const d = "d"; // depleted

const raw = `                              
                              
 mmmmmmm                       
   mmmmmmmm                   
          mmmmmmmmmmmm        
           bbbb   mmmmm       
                   mmmm       
              c    mmmm       
                   mmmm       
       ddddd       mmmm       
                              
         mmmmmmmmmm           
                mmmmmmmm      
  mmmmmmmm     mmmm           
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              `;

export const DefaultWorld = raw.split("\n").map((l) => l.split(""));
console.log(DefaultWorld);
