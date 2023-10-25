import fs from 'fs';


/**
 * 
 * @param {string} path 
 * @param {string} nombreArchivo 
 * @returns {ARRAYCAES} archivoCAEArray
 */
const leerArchivoCAES = (path,nombreArchivo) => {
    try {
     
        const existeArchivoCAE = fs.readFileSync(path+nombreArchivo);
        const archivoCAEString = existeArchivoCAE.toString();

        if(archivoCAEString.length  === 0 || archivoCAEString.length  < 8) return ( `El archivo ${nombreArchivo} no tiene datos o tiene muy pocos datos, revisalo`)

        const archivoCAEArray = archivoCAEString.split('\r\n');
        return archivoCAEArray;
    
    }catch(error){
        console.log( `\x1b[31m%s\x1b`,`El archivo ${nombreArchivo} no existe en la ruta indicada ${path}`)
        throw new Error (  `${error.message}`)
    }
}
/**
 * 
 * @param {ARRAYCAES} archivoCAE 
 */





export {
    leerArchivoCAES
}