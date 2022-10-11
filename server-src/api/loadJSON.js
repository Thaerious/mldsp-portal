import Path from "path";
import FS from "fs";

export default function loadJSON(...paths){
    return JSON.parse(FS.readFileSync(Path.join(...paths))); 
}