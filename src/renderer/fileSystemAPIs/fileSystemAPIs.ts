export const getDirContents = async (path: string[]) => {
  let pathString = ''
  path.forEach(p => {
    pathString = pathString + "/" + p
  })
  let contents = await window.electron.ipcRenderer.invoke('directoryContents', [pathString])
  return contents.filter((s: string) => !s.startsWith('.'))
}

export const readLocalFile = (path: string, projectID: string) => {
  /* let pathString = ''
  path.forEach(p => {
    pathString = pathString + "/" + p
  }) */
  return window.electron.ipcRenderer.invoke('readFile', [path, projectID])
}

export const uploadFile = async (name: string, input: any) => {
  const jsonString = JSON.stringify(input)
  return window.electron.ipcRenderer.invoke('saveFile', [name, jsonString]).then(() => console.log('saved'))
}

export const deleteFile = (name: string) => {
  window.electron.ipcRenderer.invoke('deleteFile', [name]).then(() => console.log('deleted'))
}

export const createFolder = (name: string) => {
  window.electron.ipcRenderer.invoke('createFolder', [name]).then(() => console.log('created'))
}

export const deleteFolder = (name: string) => {
  window.electron.ipcRenderer.invoke('deleteFolder', [name]).then(() => console.log('deleted'))
}
