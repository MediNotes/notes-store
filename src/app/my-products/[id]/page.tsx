import PriceTag from "@/components/PriceTag";
import { prisma } from "@/lib/db/prisma";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";

interface ProductPageProps {
    params: {
        id: string;
    };
}

const getProduct = cache(async (id: string) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) notFound();
    return product;
});

export async function generateMetadata({
    params: { id },
}: ProductPageProps): Promise<Metadata> {
    const product = await getProduct(id);

    return {
        title: product.name + " - Medcipher",
        description: product.description,
        openGraph: {
            images: [{ url: product.imageUrl }],
        },
    };
}

export default async function MyProductPage({
    params: { id },
}: ProductPageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/api/auth/signin?callbackUrl=/my-products");
    }
    const product = await getProduct(id);
    //Todo: There is a better way
    if (product?.userId != session.user.id) notFound();

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <Image
                src={product.imageUrl}
                alt={product.name}
                width={500}
                height={500}
                className="rounded-lg"
                priority
            />

            <div>
                <h1 className="text-5xl font-bold">{product.name}</h1>
                <PriceTag price={product.price} className="mt-4" />
                <p className="py-6">{product.description}</p>
                <div className="flex items-center gap-2">
                    <button
                        className="btn-primary btn"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
}
