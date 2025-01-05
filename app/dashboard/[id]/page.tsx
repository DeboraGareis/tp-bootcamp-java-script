'use client';

import { createClient } from "@/utils/supabase/client";
import styles from "./stylesId.module.css";
import styles2 from "./../stylesDashboard.module.css";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const supabase = createClient();

export default function ContentProject() {
  let {id} = useParams();
  const router = useRouter();

  const [TextValue, setTextValue] = useState("");
  const [NameValue, setNameValue] = useState("");
  //const [projectId, setProjectId] = useState(id);

  const loadProject = async () => {
    try {
      if (id == "-1") {
        // Crear un nuevo proyecto
        const { data, error } = await supabase
          .from("project")
          .insert({ name: "nombre-proyecto", content: "" })
          .select()
          .single();

        if (error) throw error;

        // Actualizar el estado con el nuevo proyecto
        id=data.id;
        setNameValue(data.name);
        setTextValue(data.content);

        // Actualizar la URL con el nuevo id
        router.replace(`/dashboard/${data.id}`);
      }
        // Cargar un proyecto existente
        const { data, error } = await supabase
          .from("project")
          .select()
          .eq("id", id)
          .single();

        if (error) throw error;

        setNameValue(data.name);
        setTextValue(data.content);
      
    } catch (error) {
      console.error("Error al cargar el proyecto:"/*, error.message*/);
    }
  };

  useEffect(() => {
    loadProject();
  }, []);

  const saveChanges = async () => {
    try {
      const { error } = await supabase
        .from("project")
        .update({ name: NameValue, content: TextValue })
        .eq("id", id);

      if (error) throw error;

      alert("Cambios guardados exitosamente.");
    } catch (error) {
      console.error("Error al guardar los cambios:"/*, error.message*/);
      alert("Hubo un error al guardar los cambios.");
    }
  };

  return (
    <div>
      <div className={styles.container}>
        <input
          type="text"
          name="NameValue"
          className={styles.NameBlock}
          value={NameValue}
          onChange={(e) => setNameValue(e.target.value)}
        />
      </div>

      <div className={styles.container}>
        <textarea
          name="textValue"
          className={styles.TextBlock}
          value={TextValue}
          onChange={(e) => setTextValue(e.target.value)}
        ></textarea>
      </div>

      <button onClick={saveChanges} className={`ml-4 text-sm`}>
        Guardar
      </button>

      <div className={styles.BottonSpace}>
        <br />
        <br />
        <a className={styles2.BottonBack} href="/dashboard">
          Volver
        </a>
      </div>
    </div>
  );
}
