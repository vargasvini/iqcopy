const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu, screen} = electron;

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
    // const { width, height } = screen.getPrimaryDisplay().workAreaSize
    // let displays = screen.getAllDisplays()
    // let externalDisplay = displays.find((display) => {
    //     return display.bounds.x !== 0 || display.bounds.y !== 0
    // })
    //Create new window
    mainWindow = new BrowserWindow({
        // x: externalDisplay.bounds.x + 50,
        // y: externalDisplay.bounds.y + 50,
        width:1024,
        height:768,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false
    });
    //Load html file into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Quit app when closed
    mainWindow.on('closed',function(){
        app.quit();
    });
    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTempalte);
    Menu.setApplicationMenu(mainMenu);
    mainWindow.setAutoHideMenuBar(true)
    //Menu.setApplicationMenu(null);
});

//Handle createAddWindow
function createAddWindow(){
    //Create new window
    addWindow = new BrowserWindow({
        width:200,
        height:300,
        title: 'Add Config'
    });
    //Load html file into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Garbage collector handle
    addWindow.on('closed', function(){
        addWindow = null;
    });
}

//Create menu template
const mainMenuTempalte = [
    {
        label: 'File',
        submenu:[
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items'
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin'? 'Command+Q' : 'Ctrl+Q',
                click(){app.quit()}
            }
        ]
    }
]

//Add developer tools
if(process.env.NODE_ENV != 'production'){
    mainMenuTempalte.push({
        label:'Developer Tools',
        submenu:[
            {
            label: 'Toggle DevTools',
            accelerator: process.platform == 'darwin'? 'Command+Q' : 'Ctrl+I',
            click(item, focusedWindow){
                focusedWindow.toggleDevTools();
            },
        },
        {
            role: 'reload'
        }
     ]
    });
}