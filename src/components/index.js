import React, { useState } from 'react';
// import './App.css';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import toGeoJSON from '@mapbox/togeojson';
import { Button, Table } from 'react-bootstrap';

// import 'leaflet/dist/leaflet.css';
// import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [kmlData, setKmlData] = useState(null);
  const [elementCount, setElementCount] = useState({});
  const [elementDetails, setElementDetails] = useState([]);
  const [mapData, setMapData] = useState(null);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(event.target.result, "text/xml");
        const geoJsonData = toGeoJSON.kml(xmlDoc);
        setKmlData(xmlDoc);
        setMapData(geoJsonData);
        countElementTypes(xmlDoc);
        getElementDetails(xmlDoc);
      };
      reader.readAsText(file);
    }
  };

  // Count different element types in KML
  const countElementTypes = (kmlData) => {
    const counts = {
      Point: 0,
      LineString: 0,
      Polygon: 0,
      MultiLineString: 0
    };

    const elements = kmlData.getElementsByTagName("Placemark");
    Array.from(elements).forEach((placemark) => {
      const type = placemark.getElementsByTagName("*")[0].nodeName;
      if (counts[type] !== undefined) {
        counts[type]++;
      }
    });
    setElementCount(counts);
  };

  // Get the element details (total length for lines, LineStrings, and MultiLineStrings)
  const getElementDetails = (kmlData) => {
    const details = [];
    const elements = kmlData.getElementsByTagName("Placemark");
    Array.from(elements).forEach((placemark) => {
      const type = placemark.getElementsByTagName("*")[0].nodeName;
      if (type === "LineString" || type === "MultiLineString") {
        const coords = placemark.getElementsByTagName("coordinates")[0].textContent.trim().split(" ");
        const length = calculateLength(coords);
        details.push({ type, length });
      }
    });
    setElementDetails(details);
  };

  // Calculate total length of a LineString or MultiLineString (simplified)
  const calculateLength = (coords) => {
    // In a real implementation, you would calculate distance using Haversine or another geospatial method
    return coords.length;
  };

  // Show summary table
  const showSummary = () => {
    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Element Type</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(elementCount).map((key) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{elementCount[key]}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  // Show detailed info
  const showDetails = () => {
    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Element Type</th>
            <th>Total Length</th>
          </tr>
        </thead>
        <tbody>
          {elementDetails.map((detail, index) => (
            <tr key={index}>
              <td>{detail.type}</td>
              <td>{detail.length}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <div className="App">
      <h1>KML File Map Viewer</h1>
      <input type="file" accept=".kml" onChange={handleFileUpload} />

      <div className="buttons">
        <Button variant="primary" onClick={() => setElementCount({})}>Summary</Button>
        <Button variant="secondary" onClick={() => setElementDetails([])}>Detailed</Button>
      </div>

      {elementCount && Object.keys(elementCount).length > 0 && showSummary()}
      {elementDetails.length > 0 && showDetails()}

      {mapData && (
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '500px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <GeoJSON data={mapData} />
        </MapContainer>
      )}
    </div>
  );
}

export default App;
