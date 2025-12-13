import { json } from "@sveltejs/kit";
import { Jimp } from "jimp";
import jsQR from "jsqr";

/**
 * Parsea el string del código QR WiFi
 * @param {string} qrText - Texto del código QR
 * @returns {Object|null} Información del WiFi o null si no es válido
 */
function parseWiFiQR(qrText)
{
  console.log('🔍 Parseando WiFi QR. Texto recibido:', qrText);

  // Verificar que empiece con WIFI:
  if (!qrText.toUpperCase().startsWith('WIFI:')) {
    console.log('❌ No es un QR de WiFi');
    return null;
  }

  // Extraer los campos S (SSID), T (Type/Security), P (Password)
  // Los campos pueden estar en cualquier orden
  const ssidMatch = qrText.match(/S:([^;]*);?/i);
  const typeMatch = qrText.match(/T:([^;]*);?/i);
  const passwordMatch = qrText.match(/P:([^;]*);?/i);

  if (ssidMatch && passwordMatch) {
    const result = {
      ssid: ssidMatch[1],
      password: passwordMatch[1],
      security: typeMatch ? typeMatch[1] : 'WPA'
    };
    console.log('✅ WiFi parseado exitosamente:', result);
    return result;
  }

  console.log('❌ No se encontraron los campos necesarios (S y P)');
  return null;
}

/**
 * Maneja las solicitudes POST para escanear códigos QR de WiFi
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request })
{
  try {
    console.log('🔍 Iniciando procesamiento de QR...');

    // Obtener el FormData de la solicitud
    const formData = await request.formData();
    const file = formData.get('qrImage');

    console.log('📁 Archivo recibido:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    });

    // Validar que se recibió un archivo
    if (!file || !(file instanceof File)) {
      console.log('❌ No se recibió archivo válido');
      return json(
        {
          error: 'No se recibió ninguna imagen válida'
        },
        { status: 400 }
      );
    }

    // Validar el tamaño del archivo (máximo 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      console.log('❌ Archivo demasiado grande:', file.size);
      return json(
        {
          error: 'El archivo es demasiado grande. Máximo 5MB'
        },
        { status: 400 }
      );
    }

    // Validar el tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.log('❌ Tipo de archivo no válido:', file.type);
      return json(
        {
          error: 'Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WebP)'
        },
        { status: 400 }
      );
    }

    console.log('✅ Validaciones pasadas, convirtiendo a buffer...');

    // Convertir el archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('📷 Buffer creado, leyendo imagen con Jimp...');

    // Leer la imagen con Jimp
    const image = await Jimp.read(buffer);
    console.log('🖼️ Imagen leída:', {
      width: image.bitmap.width,
      height: image.bitmap.height
    });

    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height
    };

    console.log('🔎 Intentando decodificar QR...');

    // Decodificar el código QR
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (!code) {
      console.log('❌ No se detectó código QR en la imagen');
      return json(
        {
          error: 'No se pudo detectar un código QR en la imagen'
        },
        { status: 400 }
      );
    }

    console.log('✅ QR detectado! Contenido:', code.data);

    // Parsear la información del WiFi
    const wifiInfo = parseWiFiQR(code.data);

    if (!wifiInfo) {
      console.log('❌ El QR no contiene información WiFi válida');
      console.log('📄 Contenido raw del QR:', code.data);
      return json(
        {
          error: 'El QR no contiene información de WiFi válida',
          rawData: code.data
        },
        { status: 400 }
      );
    }

    console.log('✅ WiFi info parseada exitosamente:', wifiInfo);

    // Devolver la información del WiFi
    return json({
      success: true,
      network: wifiInfo.ssid,
      password: wifiInfo.password,
      security: wifiInfo.security
    });

  } catch (error) {
    console.error('💥 Error procesando QR:', error);
    console.error('Stack trace:', error.stack);
    return json(
      {
        error: 'Error procesando la imagen',
        details: error.message
      },
      { status: 500 }
    );
  }
}