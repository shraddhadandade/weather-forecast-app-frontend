import { Card, CardContent } from "@mui/material";
import Button from "@mui/material/Button";

function FavoriteCities({ favorites, onSelectCity, removeFavorite }) {
  return (
    <div className="w-full max-w-2xl mt-6">
      <h3 className="text-xl font-semibold mb-4 text-black">
        ⭐ Favorite Cities
      </h3>
      {favorites.length === 0 ? (
        <p className="text-gray-500">No favorite cities yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map((city) => (
            <Card
              key={city._id}
              className="p-3 shadow-md flex justify-between items-center"
            >
              <CardContent className="p-0 flex-1">
                <p
                  className="font-medium text-black cursor-pointer hover:underline"
                  onClick={() => onSelectCity(city.name)}
                >
                  {city.name}
                </p>
              </CardContent>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeFavorite(city._id)}
              >
                Remove
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoriteCities;
