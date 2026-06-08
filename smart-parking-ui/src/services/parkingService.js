export async function getInitialParkings() {
  const response = await fetch(`http://${window.location.hostname}/api/parkings`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Greška pri dohvaćanju parking podataka");
  }

  return response.json();
}