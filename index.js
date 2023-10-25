import { archivoCAES, archivoLOTE,insertarCaeEnLote,arreglaComillaSimple, pathCAES, pathLOTE, buscarRazonSocial,armarScript,crearSalida } from "./src/app.js";


//AÑO - MES - DIA
let fecha_vencimiento_cae= '20230708';
let fecha_obtencion_cae = '20231021';



const razonSocial = buscarRazonSocial(archivoLOTE)
console.log("-------------------------------------------------------\n")
console.log("EL archivo CAES se encuentra en: " + pathCAES )
console.log(`El archivo de CAES contiene ${archivoCAES.length} caes`);
console.log(`El primer CAE es ${archivoCAES[0]}`)
console.log(`El ultimo CAE es ${archivoCAES[archivoCAES.length-1]}`)
console.log("\n-------------------------------------------------------\n")
console.log("-------------------------------------------------------\n");
console.log("La razon social del lote es: " + razonSocial )
console.log("EL archivo LOTE  se encuentra en: " + pathLOTE )
console.log(`Lote CAES contiene ${archivoLOTE.length} lineas`);
console.log(`El lote se esta procesando con fecha_vencimiento_cae: ${fecha_vencimiento_cae} (año, mes , dia)`)
console.log(`El lote se esta procesando con fecha_obtencion_cae: ${fecha_obtencion_cae} (año, mes , dia)`)
console.log("\n-------------------------------------------------------\n")
let [archivoSinComillas,cantidadComillas] = arreglaComillaSimple(archivoLOTE);
let [archivoLoteConCAES,archivosProcesados] = insertarCaeEnLote(archivoSinComillas,archivoCAES,fecha_vencimiento_cae,fecha_obtencion_cae);
archivoLoteConCAES = armarScript(archivoLoteConCAES);

crearSalida(archivoLoteConCAES,razonSocial);





console.log("-------------------------------------------------------")
console.log("Se procesaron " + cantidadComillas.length + " comillas simples ");
console.log("-------------------------------------------------------")
console.log("Se procesaron en total " + archivosProcesados + " caes ");
console.log("-------------------------------------------------------")