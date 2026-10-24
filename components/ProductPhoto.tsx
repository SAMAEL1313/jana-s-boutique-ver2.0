import Image, { type ImageProps } from "next/image";
import { imageSrc } from "@/lib/products";

type Props = Omit<ImageProps, "src" | "alt"> & { src: string | null | undefined; alt?: string };

/** next/image for product photos (local /images or the Supabase Storage bucket). */
export default function ProductPhoto({ src, alt, ...rest }: Props) {
  return <Image src={imageSrc(src)} alt={alt || "Product"} {...rest} />;
}
