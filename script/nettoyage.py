import pandas as pd
import os

INPUT_DIR = "neo4j/import"
OUTPUT_DIR = os.path.join(INPUT_DIR, "clean")

os.makedirs(OUTPUT_DIR, exist_ok=True)

FILES = {
    "airports.csv": ["Airport ID", "Name", "City", "Country", "IATA", "ICAO", "Latitude", "Longitude"],
    "airlines.csv": ["Airline ID", "Name", "Alias", "IATA", "ICAO", "Country", "Active"],
    "routes.csv": ["Airline", "Airline ID", "Source airport", "Source airport ID", "Destination airport", "Destination airport ID", "Codeshare", "Stops", "Equipment"]
}

def clean_airports(df):
    # Garder seulement les colonnes utiles pour le graphe de navigation
    keep = ["Airport ID", "Name", "IATA", "ICAO", "Latitude", "Longitude"]
    df = df[[c for c in keep if c in df.columns]]
    # supprimer lignes sans id ou sans coordonnées
    df = df.drop_duplicates(subset=["Airport ID"])
    df.columns = [c.lower().replace(" ", "_") for c in df.columns]

    # conversion robuste des types
    # airport_id peut contenir des valeurs invalides si lecture décalée → to_numeric + dropna
    df["airport_id"] = pd.to_numeric(df["airport_id"], errors="coerce")
    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")

    # garder uniquement lignes avec id et coordonnées valides
    df = df.dropna(subset=["airport_id", "latitude", "longitude"])
    df["airport_id"] = df["airport_id"].astype(int)

    # colonnes finales minimales (certaines peuvent manquer suivant le CSV)
    cols = [c for c in ["airport_id", "name", "iata", "icao", "latitude", "longitude"] if c in df.columns]
    df = df[cols]
    return df

def clean_airlines(df):
    # garder uniquement id et nom (utile éventuellement pour affichage)
    keep = ["Airline ID", "Name"]
    df = df[[c for c in keep if c in df.columns]]
    df = df.drop_duplicates(subset=["Airline ID"])
    df.columns = [c.lower().replace(" ", "_") for c in df.columns]
    df["airline_id"] = pd.to_numeric(df["airline_id"], errors="coerce")
    df = df.dropna(subset=["airline_id"])
    df["airline_id"] = df["airline_id"].astype(int)
    df = df[["airline_id", "name"]]
    return df

def clean_routes(df):
    # garder seulement les champs essentiels pour construire les arêtes du graphe
    candidates = ["Airline ID", "Source airport ID", "Destination airport ID", "Stops"]
    present = [c for c in candidates if c in df.columns]
    df = df[present]
    # retirer routes sans ids d'aéroport
    if "Source airport ID" in df.columns and "Destination airport ID" in df.columns:
        df = df.dropna(subset=["Source airport ID", "Destination airport ID"])
    df = df.drop_duplicates()
    df.columns = [c.lower().replace(" ", "_") for c in df.columns]

    # conversions robustes
    if "source_airport_id" in df.columns:
        df["source_airport_id"] = pd.to_numeric(df["source_airport_id"], errors="coerce")
    if "destination_airport_id" in df.columns:
        df["destination_airport_id"] = pd.to_numeric(df["destination_airport_id"], errors="coerce")
    if "airline_id" in df.columns:
        df["airline_id"] = pd.to_numeric(df["airline_id"], errors="coerce")

    # supprimer routes avec ids non valides puis caster
    for col in ["source_airport_id", "destination_airport_id"]:
        if col in df.columns:
            df = df.dropna(subset=[col])
            df[col] = df[col].astype(int)

    if "airline_id" in df.columns:
        # garder les NA si nécessaire, utiliser Int64 si on veut garder les NA
        df["airline_id"] = df["airline_id"].astype("Int64")

    cols = [c for c in ["airline_id", "source_airport_id", "destination_airport_id", "stops"] if c in df.columns]
    df = df[cols]
    return df

# === Nettoyage principal ===
for file_name, expected_cols in FILES.items():
    file_path = os.path.join(INPUT_DIR, file_name)
    print(f"🔹 Nettoyage de {file_name}...")
    if not os.path.exists(file_path):
        print(f"⚠️  Fichier introuvable, on passe: {file_path}")
        continue

    # Lecture prudente : tenter header=0 si les en-têtes correspondent, sinon relire sans en-tête
    df = None
    try:
        df_try = pd.read_csv(file_path, header=0, dtype=str)
    except Exception:
        df_try = None

    if df_try is not None and set(expected_cols).issubset(set(df_try.columns)):
        # fichier avec header contenant au moins les colonnes attendues
        df = df_try[expected_cols].copy()
    else:
        # fichier sans header ou colonnes inattendues : lire sans header et prendre les N premières colonnes
        raw = pd.read_csv(file_path, header=None, dtype=str)
        df = raw.iloc[:, :len(expected_cols)].copy()
        df.columns = expected_cols

    if "airport" in file_name:
        df_clean = clean_airports(df)
    elif "airline" in file_name:
        df_clean = clean_airlines(df)
    elif "route" in file_name:
        df_clean = clean_routes(df)
    else:
        df_clean = df

    output_path = os.path.join(OUTPUT_DIR, file_name)
    df_clean.to_csv(output_path, index=False)
    print(f"Fichier nettoyé enregistré : {output_path}")

print("\n Nettoyage terminé. CSV propres prêts pour import")
