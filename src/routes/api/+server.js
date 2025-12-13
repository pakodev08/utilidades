import { json } from "@sveltejs/kit";

export async function GET() {
    return json({ message: "hello" });
}


const POST = async() => { 
    return json({ message: "hello soy el post" });
}

export { POST };   