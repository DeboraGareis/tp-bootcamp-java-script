import { createClient } from "@/utils/supabase/server";
import Project from "./components/Project";
import { redirect } from "next/dist/server/api-utils";
import styles from "./stylesDashboard.module.css";


export default async function dashboard() {
    
    const supabase = await createClient();
    const { data, error } = await supabase.from("project").select(`
        id,
        name,
        content
    `);

    if (error) {
        console.error(error);
        return <div>Error cargando los proyectos</div>;
    }

    console.log("datos:", data, error);

    return (
        <div> 
            <div className={styles.BottonSpace}>
                <a href="/dashboard/-1" className={styles.BottonCreateNew} >Nuevo</a>
            </div>
            
            <div >
                {data?.map(proy => <Project key={`project-id-${proy.id}`} {...proy} />)}
            </div>
            
            <div className={styles.BottonSpace}>
                <a className={styles.BottonBack} href="/">Volver</a>
            </div>
            
        </div>
    );
};

