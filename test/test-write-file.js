  const fs = require("fs")
  const path = require("path")
  
  const directory = "c:\\Flexlm";
  const filename = "license.lic"

  const data = "hei2"
    
  fs.mkdir(directory, { recursive: true }, (error) => {
    if (error) {
      console.log(error);
    }
  });

  fs.writeFileSync(path.join(directory, filename), data)