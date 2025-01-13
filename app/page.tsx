import { createClient } from "@/utils/supabase/server";

export default async function Home() {

   const supabase = await createClient();
    //Si el usuario no existe se muestra esta pagina para iniciar sesion o registrarse
      
   const {
       data: { user },
     } = await supabase.auth.getUser();
        
  return (
    <>  
      <div className=" items-center justify-center text-center ">
          <h1>Bienvenido!</h1>
          <p>Con esta app podras crear notas o gestionar proyectos colaborativos </p>
      </div>
      
          {(!user) && (
            <div>
              <p>Puedes iniciar sesion o registrarte accediendo a:</p>
              <br /><a className="flex  justify-center items-center font-bold border" href = "../sign-in"> Iniciar sesión </a>
              <br /><a className="flex  justify-center items-center font-bold border" href = "../sign-up"> Registrarse </a>
              </div>
          )}
 
    </>
  );
}