const electron = require('electron')
const url = require('url')
const path = require('path')
const { Menu } = require('electron')
const {app, BrowserWindow, ipcMain} = electron

// Mode production ou dev
process.env.NODE_ENV = 'production'

let mainWindow, addWindow

// Demarrage de l'app

app.on('ready', function(){
    // Nouvelle fenêtre
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration:true,
            contextIsolation: false
        }
    })
    // Injection de mainWindow.html dans la fenêtre
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true,
    }));
   
    
    // Quitter l'app si mainWindow est quitté
    mainWindow.on('closed',function(){
        app.quit()
    })

    // Affichage du menu custom 
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)
})

// Creation fenêtre d'ajout de produit
function createAddWindow(){
     // Nouvelle fenêtre
     addWindow = new BrowserWindow({
         width: 300,
         height: 200,
         title: "Ajout d'un produit",
         webPreferences:{
             nodeIntegration:true,
             contextIsolation: false
         }
     });
     // Injection de addWindow.html dans la fenêtre
     addWindow.loadURL(url.format({
         pathname: path.join(__dirname, 'addWindow.html'),
         protocol: 'file',
         slashes: true
     }));
     addWindow.on('close', function(){
         addWindow = null
     })
}

// récupération de l'input
ipcMain.on('product:add', function(e,product){
    console.log(product)
    mainWindow.webContents.send('product:add',product)
    addWindow.close()
})

// Creation du menu 
const mainMenuTemplate = [
    {
        label: 'Fichier',
        submenu: [
            {
                label: 'Ajouter un produit',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Effacer les produits',
                click(){
                    mainWindow.webContents.send('product:clear')
                }
            },
            {
                label: 'Quitter',
                // Ajout d'un raccourcie clavier la ternaire vérifie sous quelle plateforme nous sommes win/mac
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit()
                }
            }
        ]
    }
];

// Modification du menu pour macOs
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({})
}

// Ajouter dev tool seulement en dev
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Dev Tools',
        submenu: [
            {
                label: 'Ouvrir',
                accelerator: process.platform == 'darwin' ? 'Command+D' : 'Ctrl+D',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools()
                }
            },
            {
                label: 'Recharger',
                role: 'reload'
            }
        ]
    })
}