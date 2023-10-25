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

const buscarRazonSocial = (archivoLote) => {    
    const razonSocial = [];
    const archivoLOTEcopia = [...archivoLote];
    const regex = new RegExp(/[".<razon_social></razon_social>"]/g)
    for (let index = 0; index < archivoLOTEcopia.length; index++) {
        if(archivoLOTEcopia[index].includes("<razon_social>")){
            archivoLOTEcopia[index] = archivoLOTEcopia[index].replace(regex, "") 
            razonSocial.push(archivoLOTEcopia[index].trim()) 
            break;
        }
    
    }
    
    return razonSocial;
}
const insertarCaeEnLote = (archivoLote,archivoCAES,fecha_vencimiento_cae,fecha_obtencion_cae) => {
   let i = 0,j=0;
   if(fecha_obtencion_cae.length != 8 || fecha_vencimiento_cae.length != 8) throw new Error ('Error en las fechas de vencimiento y/o obtencion del cae');
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

const arreglaComillaSimple = (archivoLOTE) => {
    
        
        const archivoLOTEcopia  = [...archivoLOTE];
        const encontradoEn = [];
       
        for (let index = 0; index < archivoLOTEcopia.length; index++) {
          if (archivoLOTEcopia[index].includes("'")) {
              archivoLOTEcopia[index] = archivoLOTEcopia[index].replaceAll(/'/g, "'||''''||'");
              encontradoEn.push(index+1);
          }
        }
      
    
        return [archivoLOTEcopia,encontradoEn];
      
}

const armarScript = (archivoLOTE) => {
    const archivoLoteAArrayString = [...archivoLOTE];

    archivoLoteAArrayString[0] = "str:='" + archivoLoteAArrayString[0];
    archivoLoteAArrayString[395] = archivoLoteAArrayString[395] + "'||chr(10);";
    archivoLoteAArrayString[396] = "str1:='"+archivoLoteAArrayString[396];
 
    let n = 2;
    let j = 0;
    // arma la concatenacion para el script
    for(j;j<archivoLoteAArrayString.length;j++){
        if(j==395*n){
            archivoLoteAArrayString[j] = archivoLoteAArrayString[j] + "'||chr(10);";
            archivoLoteAArrayString.splice(j+1,0,"        dbms_lob.append(str,str"+(n-1)+");");
            archivoLoteAArrayString[j+2] = "str"+n+":='"+archivoLoteAArrayString[j+2];
            n++;
        }
    }
    
    // arma cabecera del script
    archivoLoteAArrayString.unshift("set define off","declare","","str clob;","BEGIN");
    let i = 1;
    j = 4;
    for(i;i<n;i++,j++){
        archivoLoteAArrayString.splice(j,0,"str"+i+" varchar2 (32000);");
    }
    

    //arma el pie del script
    archivoLoteAArrayString[archivoLoteAArrayString.length-1] = archivoLoteAArrayString[archivoLoteAArrayString.length-1].replace('"',"'"+"||chr(10);") ;
    archivoLoteAArrayString.splice(archivoLoteAArrayString.length,0,"dbms_lob.append(str,str"+(n-1)+")';");
    archivoLoteAArrayString.splice(archivoLoteAArrayString.length,0,"");
    archivoLoteAArrayString.splice(archivoLoteAArrayString.length+1,0,"--modifica 1 registro");
    archivoLoteAArrayString.splice(archivoLoteAArrayString.length+2,0,"update feprd.lote_facturas_electronicas");
    archivoLoteAArrayString.splice(archivoLoteAArrayString.length+3,0,"set xml_cabecera_lote = str");
    archivoLoteAArrayString.splice(archivoLoteAArrayString.length+4,0,"where id_interno_lote = ");
    archivoLoteAArrayString.splice(archivoLoteAArrayString.length+5,0,"and cuit_vendedor = '';");
    archivoLoteAArrayString.splice(archivoLoteAArrayString.length+6,0,"");
    archivoLoteAArrayString.splice(archivoLoteAArrayString.length+7,0,"commit;");
    archivoLoteAArrayString.splice(archivoLoteAArrayString.length+8,0,"end;");

    return archivoLoteAArrayString;
}
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