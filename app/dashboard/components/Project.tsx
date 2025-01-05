import Link from "next/link";
import { ReactNode } from "react";
import styles from "./stylesProject.module.css";

type ParamsProject = {
    id: string;
    name: string;
    content:string;
};

/*const InitalValues:ParamsProject{
    id="-1",
    name="",
    content=""
}*/

export default function Project (params: ParamsProject) :ReactNode{
    return (
    <>
    <div className={styles.proyectBlock}>
     <Link href={`/dashboard/${params.id}`} className={styles.title}>{params.name}</Link>

    </div>
    </>
    )
    
}


