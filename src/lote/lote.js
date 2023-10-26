import fs from 'fs';


/**
 * 
 * @param {string} path 
 * @param {string} nombreArchivo 
 * @returns {ARRAYLOTE} archivoLOTErray
 */
const leerArchivoLOTE = (path,nombreArchivo) => {
    try {
     
        const existeArchivoLOTE = fs.readFileSync(path+nombreArchivo);
        const archivoLOTEString = existeArchivoLOTE.toString();

        if(existeArchivoLOTE.length  === 0 || existeArchivoLOTE.length  < 100) return ( `El archivo ${nombreArchivo} no tiene datos o tiene muy pocos datos, revisalo`)

        const archivoLOTEArray = archivoLOTEString.split('\r\n');
        return archivoLOTEArray;
    
    }catch(error){
        console.log( `\x1b[31m%s\x1b`,`El archivo ${nombreArchivo} no existe en la ruta indicada ${path}`)
        throw new Error (  `${error.message}`)
    }
}

/**
 * @param {ARRAYLOTE} archivoLOTErray
 * @returns {String} razonSocial
 */
const buscarRazonSocial = (archivoLote) => {    
    let razonSocial;
    const archivoLOTEcopia = [...archivoLote];
    const regex = new RegExp(/[".<razon_social></razon_social>:"]/g)
    try {
        for (let index = 0; index < archivoLOTEcopia.length; index++) {

            if(archivoLOTEcopia[index].includes("<razon_social>")){
                console.log(archivoLOTEcopia[index])
                archivoLOTEcopia[index] = archivoLOTEcopia[index].replace(regex, "") 
                razonSocial = (archivoLOTEcopia[index].trim()) 
                break;
            }
        
        }
        
        razonSocial === undefined ? razonSocial = "NO SE ENCONTRO LA RAZON SOCIAL":razonSocial;
    
        return " "+razonSocial+" ";
    }catch(error){
        console.log(error);
        throw new Error ('Se ha producido un error al leer el lote ' + error)
    }

}
/**
 * @param {ARRAYLOTE} archivoLote
 * @param {ARRAYLOTE} archivoCAES
 * @param {String} fecha_vencimiento_cae
 * @param {String} fecha_obtencion_cae
 */
const insertarCaeEnLote = (archivoLote,archivoCAES,fecha_vencimiento_cae,fecha_obtencion_cae) => {
   let i = 0,j=0;
   if(fecha_obtencion_cae.length != 8 || fecha_vencimiento_cae.length != 8) throw new Error ('Error en las fechas de vencimiento y/o obtencion del cae, debe ser formato YYYYMMDD valido de 8 caracteres');
   if(Number(fecha_obtencion_cae[4])>1 || Number(fecha_vencimiento_cae[4]) > 1) throw new Error ('Error en las fechas de vencimiento y/o obtencion del cae, el primer digito del mes no puede ser mayor a 1');
   if(Number(fecha_obtencion_cae[7])>3 || Number(fecha_vencimiento_cae[6]) > 3) throw new Error ('Error en las fechas de vencimiento y/o obtencion del cae, el primer digito del dia no puede ser mayor a 3');
   const longitudCaes = archivoCAES.length;

   while(i != longitudCaes){

        if(archivoLote[j].includes("</fecha_vencimiento>")){
            archivoLote.splice(j+1,0,"        <cae>" + archivoCAES[i] + "</cae>");
            archivoLote.splice(j+2,0,`        <fecha_vencimiento_cae>${fecha_vencimiento_cae}</fecha_vencimiento_cae>`);
            archivoLote.splice(j+3,0,`        <fecha_obtencion_cae>${fecha_obtencion_cae}</fecha_obtencion_cae>`);
            archivoLote.splice(j+4,0,"        <resultado>A</resultado>");
            i++
            
        }

        j++;
   }

   return [archivoLote,i];
}


/**
 * 
 * @param {ARRAYLOTE} archivoLOTE 
 * @returns {[ARRAYLOTE, number]} archivoLOTEcopia, comillas
 */
const arreglaComillaSimple = (archivoLOTE) => {
    
        
        const archivoLOTEcopia  = [...archivoLOTE];
        let comillas = 0;
       
        for (let index = 0; index < archivoLOTEcopia.length; index++) {
          if (archivoLOTEcopia[index].includes("'")) {
              archivoLOTEcopia[index] = archivoLOTEcopia[index].replaceAll(/'/g, "'||''''||'");
              comillas++;
              
          }
        }
      
    
        return [archivoLOTEcopia,comillas];
      
}

/**
 * 
 * @param {ARRAYLOTE} archivoLOTE 
 * @returns {ARRAYLOTE} archivoLote
 */
const armarScript = (archivoLOTE) => {
    const archivoLote = [...archivoLOTE];

    archivoLote[0] = "str:='" + archivoLote[0];
    archivoLote[395] = archivoLote[395] + "'||chr(10);";
    archivoLote[396] = "str1:='"+archivoLote[396];
 
    let n = 2;
    let j = 0;
    // arma la concatenacion para el script
    for(j;j<archivoLote.length;j++){
        if(j==395*n){
            archivoLote[j] = archivoLote[j] + "'||chr(10);";
            archivoLote.splice(j+1,0,"        dbms_lob.append(str,str"+(n-1)+");");
            archivoLote[j+2] = "str"+n+":='"+archivoLote[j+2];
            n++;
        }
    }
    
    // arma cabecera del script
    archivoLote.unshift("set define off","declare","","str clob;","BEGIN");
    let i = 1;
    j = 4;
    for(i;i<n;i++,j++){
        archivoLote.splice(j,0,"str"+i+" varchar2 (32000);");
    }
    

    //arma el pie del script

    archivoLote[archivoLote.length-1] = archivoLote[archivoLote.length-1] += "'||chr(10);" ;
    archivoLote.splice(archivoLote.length,0,"dbms_lob.append(str,str"+(n-1)+");");
    archivoLote.splice(archivoLote.length,0,"");
    archivoLote.splice(archivoLote.length+1,0,"--modifica 1 registro");
    archivoLote.splice(archivoLote.length+2,0,"update feprd.lote_facturas_electronicas");
    archivoLote.splice(archivoLote.length+3,0,"set xml_cabecera_lote = str");
    archivoLote.splice(archivoLote.length+4,0,"where id_interno_lote = ");
    archivoLote.splice(archivoLote.length+5,0,"and cuit_vendedor = '';");
    archivoLote.splice(archivoLote.length+6,0,"");
    archivoLote.splice(archivoLote.length+7,0,"commit;");
    archivoLote.splice(archivoLote.length+8,0,"end;");

    return archivoLote;
}

/**
 * 
 * @param {ARRAYLOTE} archivoLOTE
 * @param {String} nombreArchivo 
 * @returns {void}
 */
const crearSalida = (archivoLOTE,nombreArchivo) => {
    const date = new Date().toString().split('(')[0].replaceAll(":","_");
  
    const nombre = `salida${nombreArchivo}${date}.txt`
    try {
        fs.writeFileSync("./"+nombre,archivoLOTE.join("\r\n"),'utf-8');
        console.log("Archivo: " + nombre + " creado correctamente. En la ruta " + process.cwd() + "\n");
    }catch(error){
        console.log("Ocurrio un error al escribir el archivo: " )
        throw new Error(error)
    }
}

export {
    leerArchivoLOTE,
    insertarCaeEnLote,
    arreglaComillaSimple,
    buscarRazonSocial,
    armarScript,
    crearSalida
}