import Image, { type ImageProps } from "next/image";
import { imageSrc } from "@/lib/products";

type Props = Omit<ImageProps, "src" | "alt"> & { src: string | null | undefined; alt?: string };

/** next/image for product photos; uploaded images are served by our API and skip optimization. */
export default function ProductPhoto({ src, alt, ...rest }: Props) {
  const resolved = imageSrc(src);
  return (
    <Image
      src={resolved}
      alt={alt || "Product"}
      unoptimized={resolved.startsWith("/api/")}
      {...rest}
    />
  );
}
