const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu} = electron;

let mainWindow;
let addWindow;

if(handleSquirrelEvent(app)){
    return;
}
// Listen for app to be ready
app.on('ready', function(){
    //Create new window
    mainWindow = new BrowserWindow({
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

function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};