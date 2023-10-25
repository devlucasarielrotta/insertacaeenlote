import { __dirname,path } from './utils/path.js';
import { leerArchivoCAES } from "./caes/cae.js";
import { leerArchivoLOTE,insertarCaeEnLote,arreglaComillaSimple,buscarRazonSocial,armarScript,crearSalida } from './lote/lote.js';

const pathCAES = path.join(__dirname+'/db/');
const nombreArchivoCAES = 'caes.txt';

const pathLOTE = path.join(__dirname+'/db/')
const nombreArchivoLOTE = 'lote.txt';

const archivoCAES = leerArchivoCAES(pathCAES,nombreArchivoCAES);
const archivoLOTE = leerArchivoLOTE(pathLOTE,nombreArchivoLOTE);



export {
    archivoCAES,
    archivoLOTE,
    pathCAES,
    pathLOTE,
    insertarCaeEnLote,
    arreglaComillaSimple,
    buscarRazonSocial,
    armarScript,
    crearSalida
}