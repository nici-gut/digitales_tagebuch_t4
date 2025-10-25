import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// Ein geheimer Schlüssel. In einer echten App MUSS dieser
// sicher gespeichert werden (z.B. in einer .env Datei).
const secret = new TextEncoder().encode(
  "ein-sehr-sicherer-geheimer-schluessel-der-lang-ist",
);
const alg = "HS256"; // Der Verschlüsselungsalgorithmus

/**
 * Erstellt ein neues JWT für einen Benutzer.
 */
export async function createJWT(username: string): Promise<string> {
  const token = await new SignJWT({ username: username, "urn:example:claim": true })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer("urn:example:issuer")
    .setAudience("urn:example:audience")
    .setExpirationTime("2h") // Token ist 2 Stunden gültig
    .sign(secret);

  return token;
}

/**
 * Verifiziert ein JWT und gibt den "Payload" (die Daten) zurück,
 * oder null, wenn das Token ungültig ist.
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: "urn:example:issuer",
      audience: "urn:example:audience",
    });
    // Token ist gültig
    return payload;
  } catch (err) {
    // Token ist ungültig (abgelaufen, falsche Signatur etc.)
    return null;
  }
}