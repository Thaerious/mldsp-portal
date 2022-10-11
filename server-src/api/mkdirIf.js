import Path from "path";
import FS from "fs";

/**
 * If it doesn't exist, create a the directory from the conjoined paths variable. 
 * Returns joined path.
 */
export default function mkdirIf(...paths){
    const path = Path.join(...paths);
    const parsed = Path.parse(path);

    if (!parsed.dir || parsed.dir === "") return path;
    
    if (!FS.existsSync(parsed.dir)){
        FS.mkdirSync(parsed.dir, { recursive: true });    
    }

    return path;
}