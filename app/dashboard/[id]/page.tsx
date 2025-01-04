'use client'
import { createClient } from "@/utils/supabase/client";
import styles from "./stylesId.module.css";
import { ChangeEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

//import { PostgrestError } from "@supabase/supabase-js";

const supabase = createClient();
export default function contentProject (params: { id: number } ){
    let {id} = useParams(); //console.log("id: ",id);

    const [TextValue, setTextValue] = useState("");
    const [NameValue, setNameValue] = useState("");
   
    const loadProject= async () => {
        /*if (id ==(-1))
            {
          // El usuario hace clic en crear proyecto dentro de la estaña del dashboard
          // Nuevo proyecto --> hago un insert en la BD
          const { error } = await supabase
          .from('project')
          .insert({name:`nombre-proyecto-${id}`,content: " "});
            }
        //El usuario elige un proyecto existente
        // Traigo la info existente en la bd del proyecto
        else{*/
        
            const supabase = await createClient();
            const { data, error } = await supabase
            .from('project')
            .select().eq(`id`, id).single();
            console.log("datos: ", data, "error", error );
             
            setNameValue( data?.name );
            setTextValue( data?.content );
        //    }  
        }
        useEffect(() => {loadProject()},[])
    
    async function saveChanges(): Promise<void> {
        const { error } = await supabase
          .from('project')
          .update({name:`${NameValue}`,content: `${TextValue}`})
          .eq('id', id);
    }

    return (
        
        <div>
            <div className={styles.container}>
            <input
            type="text"
            name="NameValue"
            className={styles.NameBlock}
            value= {NameValue}
            onChange={e => setNameValue(e.target.value)}
            ></input>
            </div>
         
            <div className={styles.container}>
            <textarea
            
            name="textValue"
            className={styles.TextBlock}
            value= {TextValue}
            onChange={e => setTextValue(e.target.value)}
            ></textarea>
            </div>
           
        <button onClick={() => saveChanges()} className={`ml-4 text-sm `}> Guardar
        </button>
        </div> 
    );
}