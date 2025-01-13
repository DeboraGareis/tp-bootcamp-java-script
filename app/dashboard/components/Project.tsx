'use client';

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import styles from "./stylesProject.module.css";
import { User } from "@supabase/supabase-js";

type ParamsProject = {
    id: string;
    name: string;
    content:string;
    access:boolean;
    id_autor:string;
};

const supabase = createClient();

export default function Project (params: ParamsProject) :ReactNode{
    const [IdAuthUser, setIdAuthUser] = useState<string|undefined>();
    const [users, setUsers] = useState<User[] | null>();
    const [editUsers, setEditUsers] = useState<{}[]| null>();
    //Estado para controlar el acceso: privado (true, por defecto) o publico (false)
    const [PrivateAccess, setPrivateAccess] = useState(params.access);

    useEffect(() => {
    const getAutor =async () => {
        
      //Obtengo el usuario actual
        const { data:auth, error:errorWithAuth } = await supabase.auth.getUser();
        setIdAuthUser(auth.user?.id);
        if (errorWithAuth) {
            throw new Error(errorWithAuth.message);
        }
        
        //Obtengo todos los datos de todos los usuarios
        const { data: users, error: usersError } = await supabase.from('users').select();
        if (usersError) {
            throw new Error(usersError.message);
        }
        setUsers(users);
        }

        // obtengo los id de los editores para elegir nuevos editores o mostrar a los que pueden editar
        const fetchEditorsId = async () => {
        const { data, error } = await supabase.from("editor").select("id_editor").eq("id_project", params.id);;
            const editorIds = data?.map(editor => editor.id_editor);
            setEditUsers(editorIds);
            if (error) {
                throw new Error(error.message);
                }
            }
        getAutor();
        fetchEditorsId();
    } ,[])

    async function DeleteProject(id: string) {
      const response = await supabase
          .from('project')
          .delete()
          .eq('id', id)
      location.reload()
      }
    //funcion que permite agregar un nuevo editor, respodiendo al evento de click de usuario autor en "Permitir Acceso"
    async function GiveAccess(id: string): Promise<void> {
        const { data, error } = await supabase
        .from("editor")
        .insert({ id_project: params.id, id_editor: id})
        .select()
        .single();
        if (error) {
            throw new Error(error.message);
            }
        location.reload()
    }
    // Funcion del checkbox que maneja el cambio del estado publico/privado
  async function ChangeAccess(event: ChangeEvent<HTMLInputElement>) {
    setPrivateAccess(!PrivateAccess);
    await supabase
    .from("project")
    .update({ access:!PrivateAccess})
    .eq("id", params.id);
    
}
    return (
      <>
        {/* Para colocar un enlace para cada proyecto con su respectivo ID */}
        <div className={styles.proyectBlock}>
          <Link href={`/dashboard/${params.id}`} className={styles.title}>
            {params.name}
          </Link>
    
          {/* Para gestionar los permisos individuales a cada proyecto */}
          {IdAuthUser == params.id_autor && (
            <>
              <button onClick={() => DeleteProject(params.id)} className="ml-4 hover:border-gray-500 text-sm">
                Eliminar
              </button>
              
              {/*Div para el archivo y dar acceso publico*/}
              <div className="flex  justify-center items-center gap-3 mx-3 px-2 py-1">
              <input type="checkbox" name="access" checked={!PrivateAccess} onChange={ChangeAccess}/>
              Acceso publico 
              </div>  
              
              <div className="flex  justify-center items-center border border-gray-300 border-opacity-25 gap-5 mx-3 px-2 py-1">
                <p className="flex gap-5 items-center font-bold mb-10">Editores: </p>
                {users?.map(user => {
                  if (!editUsers?.includes(user.id)) {
                    // Mostrar botón "Permitir acceso"
                    return (
                      <div key={`user-id-${user.id}`}>
                        {user.email}
                        <button onClick={() => GiveAccess(user.id)} className="hover:border-gray-500 ml-4 text-sm">
                          Permitir acceso
                        </button>
                      </div>
                    );
                  } else {
                    // Mostrar editores existentes
                    return (
                      <div key={`user-id-${user.id}`}>
                        <p className={styles.StyleEdit}>{user.email}</p>
                      </div>
                    );
                  }
                })}
              </div>
            </>
          )}
        </div>
      </>
    );
  }