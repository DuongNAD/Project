import React, { useEffect, useState } from "react";
import "../region/style.css";
import { useParams } from "react-router-dom";
import BeachCard from "../../../components/BeachCard";
import { listRegionBeachesKeyword } from "../../../api/function";
function SeachBeaches() {
  const { keyword } = useParams();
  const [beaches, setBeaches] = useState([]);

  useEffect(() => {
    fetchData();
  }, [keyword]);
  const fetchData = async () => {
    try {
      const rs = await listRegionBeachesKeyword(keyword);
      setBeaches(rs.data?.data || []);
    } catch (error) {}
  };
  return (
    <div className="region-container">
      <h2 className="title">🌊 Seach : {keyword} </h2>
      <div className="grid">
        {beaches.length > 0 ? (
          beaches.map((beach) => (
            <div key={beach.id} className="card-wrapper">
              <BeachCard beach={beach} />
            </div>
          ))
        ) : (
          <p className="empty">There are no beaches in this area.</p>
        )}
      </div>
    </div>
  );
}

export default SeachBeaches;
