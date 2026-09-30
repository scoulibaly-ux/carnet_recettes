export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

const JPEG = "image/jpeg";
const PNG = "image/png";
const WEBP = "image/webp";

export type AllowedImageType = typeof JPEG | typeof PNG | typeof WEBP;

export type PhotoInspection =
  | {
      ok: true;
      contentType: AllowedImageType;
      extension: "jpg" | "png" | "webp";
    }
  | { ok: false; error: string };

function startsWith(bytes: Uint8Array, signature: number[]) {
  if (bytes.length < signature.length) return false;
  return signature.every((value, index) => bytes[index] === value);
}

function isWebp(bytes: Uint8Array) {
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

function detectedType(bytes: Uint8Array): AllowedImageType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return JPEG;
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return PNG;
  }
  if (isWebp(bytes)) return WEBP;
  return null;
}

function extensionFor(type: AllowedImageType): "jpg" | "png" | "webp" {
  if (type === JPEG) return "jpg";
  if (type === PNG) return "png";
  return "webp";
}

export function inspectImage(bytes: Uint8Array, declaredType: string): PhotoInspection {
  if (bytes.byteLength === 0) {
    return { ok: false, error: "Ajoutez une photo de la recette." };
  }

  if (bytes.byteLength > MAX_PHOTO_BYTES) {
    return { ok: false, error: "La photo dépasse la taille maximale de 4 Mo." };
  }

  const normalized = declaredType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (normalized !== JPEG && normalized !== PNG && normalized !== WEBP) {
    return {
      ok: false,
      error: "Seuls les formats JPEG, PNG et WebP sont acceptés.",
    };
  }

  const actual = detectedType(bytes);
  if (actual !== normalized) {
    return {
      ok: false,
      error: "Le fichier ne correspond pas à une image JPEG, PNG ou WebP.",
    };
  }

  return {
    ok: true,
    contentType: actual,
    extension: extensionFor(actual),
  };
}

export async function inspectPhotoFile(file: File): Promise<PhotoInspection> {
  if (file.size === 0) {
    return { ok: false, error: "Ajoutez une photo de la recette." };
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return { ok: false, error: "La photo dépasse la taille maximale de 4 Mo." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  return inspectImage(bytes, file.type);
}
