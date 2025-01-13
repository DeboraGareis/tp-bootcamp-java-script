import { createClient } from "@/utils/supabase/server";
import Project from "./components/Project";
import styles from "./stylesDashboard.module.css";

export default async function dashboard() {
    
    const supabase = await createClient();

    //Obtengo el usuario actual
    const { data: authUser, error:errorWithAuth } = await supabase.auth.getUser();
      if (errorWithAuth) {
              throw new Error(errorWithAuth.message);
          }
    
    //Obtengo todos los proyectos       
    const { data, error } = await supabase.from("project").select(`
        id,
        name,
        content,
        access,
        id_autor
    `);
    if (error) {
        throw new Error(error.message);
    }
    console.log("proyectos:", data.map(proj =>proj.id));
    
    
    //Obtengo todos los proyectos en los que el usuario aparece como editor       
    const { data:ProjUser , error:errorProjUser } = await supabase.from("editor")
    .select(`id_project`).eq("id_editor" , authUser.user.id);
    //guardo en un arreglo los id de dichos projectos
    const ProjEditorIds = ProjUser?.map(proj=> proj.id_project);
    if (errorProjUser) {
        throw new Error(errorProjUser.message);
    }

    return (
        <div>      
            <div className = {styles.BottonSpace}>
                <a href="/dashboard/-1" className = {styles.BottonCreateNew} key={`project-id-${authUser.user?.id}`}>Nuevo</a>
            </div>
            {
            //Organizo los proyectos en secciones segun el tipo de editor que es el usuario    
            data?.map((proj) =>
                proj.id_autor === authUser.user?.id ? (
                <>
                    <h2 className = { styles.SectionType }> Autor </h2>   
                    <Project key={`project-id-${proj.id}`} {...proj} />
                </>
                ) : ProjEditorIds?.includes(proj.id) ? (
                 <><h2 className = { styles.SectionType }>Editor </h2>
                    <Project key={`project-id-${proj.id}`} {...proj} />
                </>
                ) : proj.access === false ? (
                <>
                    <h2 className = {styles.SectionType}>Publico </h2>
                    <Project key={`project-id-${proj.id}`} {...proj} />
                </>
                
                ) : null
            )
            }
    
        </div>
    );
};

