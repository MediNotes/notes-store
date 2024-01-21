import FormSubmitButton from "@/components/FormSubmitButton";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { cache } from "react";

interface EditProductProps {
    params: { id: string };
}

export const metadata = {
    title: "Add Product - Flowmazon",
};

async function updateProduct(formData: FormData) {
    "use server";

    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/api/auth/signin?callbackUrl=/my-products");
    }

    const id = formData.get("id")?.toString();
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const fileUrl = formData.get("fileUrl")?.toString();
    const imageUrl = formData.get("imageUrl")?.toString();
    const price = Number(formData.get("price") || 0);

    if (!id || !name || !description || !fileUrl || !imageUrl || !price) {
        throw Error("Missing required fields");
    }

    await prisma.product.update({
        where: { id },
        data: { name, description, fileUrl, imageUrl, price },
    });

    redirect("/my-products/" + id);
}

const getProduct = cache(async (id: string) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) notFound();
    return product;
});


export default async function EditProductPage({
    params: { id },
}: EditProductProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/api/auth/signin?callbackUrl=/edit-product");
    }

    const product = await getProduct(id);

    if (product.userId != session.user.id) return notFound();

    return (
        <div>
            <h1 className="mb-3 text-lg font-bold">Update Product</h1>
            <form action={updateProduct}>
                <input type="hidden" name="id" value={id} />
                <input
                    required
                    name="name"
                    defaultValue={product.name}
                    className="input-bordered input mb-3 w-full"
                />
                <textarea
                    required
                    name="description"
                    className="textarea-bordered textarea mb-3 w-full"
                    defaultValue={product.description}
                >
                </textarea>
                <input
                    required
                    name="fileUrl"
                    defaultValue={product.fileUrl}
                    type="url"
                    className="input-bordered input mb-3 w-full"
                />
                <input
                    required
                    name="imageUrl"
                    defaultValue={product.imageUrl}
                    type="url"
                    className="input-bordered input mb-3 w-full"
                />
                <input
                    required
                    name="price"
                    defaultValue={product.price}
                    type="number"
                    className="input-bordered input mb-3 w-full"
                />
                <FormSubmitButton className="btn-block">Update Product</FormSubmitButton>
            </form>
        </div>
    );
}
