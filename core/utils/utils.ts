import fs from "fs"
import path from "path"

export default class Utils {
    public static async getFiles(dir: string): Promise<string[]> {
        const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name);
            return dirent.isDirectory() ? this.getFiles(res) : res;
        }));
        return Array.prototype.concat(...files);
    }

    public static removeUndefined<T>(arr: (T | undefined)[]): T[] {
        return arr.filter((item) => item !== undefined) as T[];
    }
}