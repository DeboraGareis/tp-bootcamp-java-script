'use client';

import { createClient } from "@/utils/supabase/client";
import styles from "./stylesId.module.css";
import styles2 from "./../stylesDashboard.module.css";
import { ChangeEvent,useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const supabase = createClient();

export default function ContentProject() {
  
  let {id} = useParams();
  const router = useRouter();
  // Uso useRef, para actualizar en realtime solo si es otro usuario el que modifica
  // useRef es un hook de react que permite conservar un valor entre renderizados:
  const modifier = useRef(false);
    
  //Estado para controlar el contenido del proyecto
  const [TextValue, setTextValue] = useState("");
  //Estado para controlar el nombre del proyecto
  const [NameValue, setNameValue] = useState("");
  //Estado para controlar el acceso: privado (true, por defecto) o publico (false)
  const [PrivateAccess, setPrivateAccess] = useState(true);

 ;
  const loadProject = async () => {
    
    //Obtengo el usuario actual 
    const { data: authUser, error:errorWithAuth } = await supabase.auth.getUser();
      if (errorWithAuth) {
          throw new Error(errorWithAuth.message);
      }
     
    try {
      if (id == "-1") 
        {
        // Caso en el que el usuario selecciona crear un nuevo proyecto
        const { data, error } = await supabase
          .from("project")
          .insert({ name: "nombre-proyecto", content: "", access:true, id_autor:authUser.user?.id })
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }
        // Actualizar estados con el nuevo proyecto
        id = data.id; //--> el id del proyecto ya no sera -1, sera el asignado automaticamnete en la insercion en supabase
        router.replace(`/dashboard/${data.id}`);// Actualizar la URL con el nuevo id
        setNameValue(data.name);
        setTextValue(data.content);
        setPrivateAccess(data.access);

        //hago un insert en tabla de editores con id del autor
        const { data:editor, error:errorEditor } = await supabase
        .from("editor")
        .insert({ id_project: id, id_editor:authUser.user?.id }).select().single();
        if (errorEditor) {
          throw new Error(errorEditor.message);
        }
      }
      else {
        // Caso en el que el usuario elige un proyecto existente
        const { data, error } = await supabase
          .from("project")
          .select()
          .eq("id", id)
          .single();

          if (error) {
            throw new Error(error.message);
          }
        setNameValue(data.name);
        setTextValue(data.content);
        setPrivateAccess(data.access);
      }
    } catch (error) {
      console.error("Error al cargar el proyecto");
    }
  };

  useEffect(() => {
    loadProject();
  }, []);

useEffect(() => {
    const subscriber = supabase.channel('project')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'project',
      }, (payload) => {
          if (!modifier.current && TextValue!=payload.new.content) {
          setTextValue(payload.new.content);
        } 
    })
      .subscribe();
    return () => {
      supabase.removeChannel(subscriber);
    }
  }, [TextValue]);

  // Funcion del checkbox que maneja el cambio del estado publico/privado
  async function ChangeAccess(event: ChangeEvent<HTMLInputElement>) {
      setPrivateAccess(!PrivateAccess);
      await supabase
      .from("project")
      .update({ access:!PrivateAccess})
      .eq("id", id);
  }

  return (
    <div>
      <div className={styles.container}>
        <input
          type="text"
          name="NameValue"
          className={styles.NameBlock}
          value={NameValue}
          onChange={async (e) => {
            const newName=e.target.value;
            setNameValue(newName);
            await supabase
            .from("project")
            .update({ name: newName })
            .eq("id", id);      
            }}
          />
      </div>

      <div className={styles.container}>
        <textarea
          name="textValue"
          className={styles.TextBlock}
          value={TextValue}
          onChange={async (e) => {
            modifier.current = true;  // Marcar que el usuario local está modificando
            const newText = e.target.value;
            setTextValue(newText);
            await supabase
            .from("project")
            .update({ content: newText })
            .eq("id", id);   
            modifier.current = false; // luego del cambio lo vuelvo a su valor original
          }}
        ></textarea>
      </div>

      <div className={styles.Check }>
      <input type="checkbox" name="access" checked={!PrivateAccess} onChange={ChangeAccess}/>
      Acceso publico 
      </div>    
        <br/><br/><a className={styles2.BottonBack} href="/dashboard">Volver</a>
    </div>
  );
}
