import { useState, type ChangeEvent } from 'react';
import { getCodeSandboxHost } from "@codesandbox/utils";
import { debounce } from 'lodash';
import { Routes, Route, Link } from 'react-router-dom';
import HotelPage from './pages/HotelPage';
import CountryPage from './pages/CountryPage';
import CityPage from './pages/CityPage';
import { Hotel, City, Country } from './types';

const codeSandboxHost = getCodeSandboxHost(3001);

const API_URL = codeSandboxHost ? `https://${codeSandboxHost}` : 'http://localhost:3001';

const fetchSearchResults = async (value: string): Promise<{ hotels: Hotel[], cities: City[], countries: Country[] }> => {
  const searchData = await fetch(`${API_URL}/search?query=${value}`);
  const results = await searchData.json() as { hotels: Hotel[], cities: City[], countries: Country[] };
  return results;
}

function HomePage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [showClearBtn, setShowClearBtn] = useState(false);

  const fetchData = debounce(async (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    if (query === '') {
      setHotels([]);
      setCities([]);
      setCountries([]);
      setShowClearBtn(false);
      return;
    }

    const { hotels, cities, countries } = await fetchSearchResults(query);
    setShowClearBtn(true);
    setHotels(hotels);
    setCities(cities);
    setCountries(countries);
  }, 300);

  const clearSearch = () => {
    setHotels([]);
    setCities([]);
    setCountries([]);
    setShowClearBtn(false);
  };

  return (
    <div className="container">
      <div className="row height d-flex justify-content-center align-items-center">
        <div className="col-md-6">
          <div className="dropdown">
            <div className="form">
              <i className="fa fa-search"></i>
              <input
                type="text"
                className="form-control form-input"
                placeholder="Search accommodation..."
                onChange={fetchData}
              />
              {showClearBtn && (
                <span className="left-pan" onClick={clearSearch}>
                  <i className="fa fa-close"></i>
                </span>
              )}
            </div>
            {(hotels.length || cities.length || countries.length) && (
              <div className="search-dropdown-menu dropdown-menu w-100 show p-2">
                <h2>Hotels</h2>
                {hotels.length ? hotels.map((hotel, index) => (
                  <li key={index}>
                    <Link to={`/hotels/${hotel._id}`} className="dropdown-item">
                      <i className="fa fa-building mr-2"></i>
                      {hotel.hotel_name}
                    </Link>
                    <hr className="divider" />
                  </li>
                )) : <p>No hotels matched</p>}

                <h2>Countries</h2>
                {countries.length ? countries.map((country, index) => (
                  <li key={index}>
                    <Link to={`/countries/${country._id}`} className="dropdown-item">
                      <i className="fa fa-flag mr-2"></i>
                      {country.country}
                    </Link>
                    <hr className="divider" />
                  </li>
                )) : <p>No countries matched</p>}

                <h2>Cities</h2>
                {cities.length ? cities.map((city, index) => (
                  <li key={index}>
                    <Link to={`/cities/${city._id}`} className="dropdown-item">
                      <i className="fa fa-map-marker mr-2"></i>
                      {city.name}
                    </Link>
                    <hr className="divider" />
                  </li>
                )) : <p>No cities matched</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hotels/:id" element={<HotelPage />} />
        <Route path="/countries/:id" element={<CountryPage />} />
        <Route path="/cities/:id" element={<CityPage />} />
      </Routes>
    </div>
  );
}

export default App;
