// Function to make a request to the API and update the page with the results
async function fetchUFData() {
  try {
      // Make a request to the API that provides data about Brazilian states
      const responseUF = await fetch("https://brasilapi.com.br/api/ibge/uf/v1");
      const dataUF = await responseUF.json();

      // Initialize an empty array to organize states and cities by region
      const regions = [];

      // Loop through the state data
      for (const uf of dataUF) {
          const ufName = uf.nome; // State name
          const ufRegion = uf.regiao.nome; // State's region name

          // Make a request to the API that provides data about cities in the state
          const responseCities = await fetch("https://brasilapi.com.br/api/ibge/municipios/v1/"+uf.sigla+"?providers=dados-abertos-br,gov,wikipedia");
          const ufCities = await responseCities.json();

          // If the region does not exist in the 'regions' array yet, create an empty array for it
          if (!regions[ufRegion]) {
              regions[ufRegion] = [];
          }

          // Add state and its cities' data to the corresponding region
          regions[ufRegion].push({
              stateName: ufName,
              cities: ufCities
          });
      }

      // Get references to HTML elements
      const loaderDiv = document.getElementById("loader");
      const regionSelectDiv = document.getElementById("regionSelect");
      const stateSelectDiv = document.getElementById("stateSelect");
      const tableDiv = document.getElementById("cityTable");
      const tableBodyDiv = document.getElementById("tableBody");
      const h3Div = document.getElementById("cityh3");
      const mapDiv = document.getElementById("brazil_map");
      let regionSelected = "";
      let stateSelected = "";

      // Set the default option for the region selector
      regionSelectDiv.innerHTML = "<option disabled selected value> -- select a region -- </option>";

      // Fill the region selector with the found regions
      for (const [region, states] of Object.entries(regions))
      {
          var regionOpt = document.createElement("option");
          regionOpt.value= region;
          regionOpt.innerHTML = region; // Set the region name as the option content

          // Add the option to the region selector
          regionSelectDiv.appendChild(regionOpt);
      }

      // Hide the loading indicator and display the region selector
      loaderDiv.style = "display: none";
      regionSelectDiv.style = "display: block";
      

      // Set an event listener for when the region selector is changed
      regionSelectDiv.addEventListener("change", e => {
          mapDiv.style = "display: block";  

          // Clear the state selector, table, and city title
          stateSelectDiv.innerHTML = "<option disabled selected value> -- select a state -- </option>";
          tableBodyDiv.innerHTML = "";
          tableDiv.style = "display: none";
          h3Div.style = "display: none";
          regionSelected = e.target.value; // User-selected region

          // Fill the state selector with the states of the selected region
          regions[e.target.value].map(state => {
              var stateOpt = document.createElement("option");
              stateOpt.value= state.stateName;
              stateOpt.innerHTML = state.stateName; 
              stateSelectDiv.appendChild(stateOpt);
          });

          // Display the state selector
          stateSelectDiv.style = "display: block";
      });

      // Set an event listener for when the state selector is changed
      stateSelectDiv.addEventListener("change", e => {
          tableBodyDiv.innerHTML = ""; // Clear the table content
          stateSelected = e.target.value; // User-selected state

          // Fill the table with cities from the selected state
          tableBodyDiv.innerHTML = regions[regionSelected].map(state => {
              let content = "";
              if(state.stateName == stateSelected){
                  state.cities.map(city => {
                      content += `<tr><td>${city.codigo_ibge}</td><td>${city.nome}</td></tr>`
                  })
              }
              return content;
          });

          // Display the table and city title
          tableDiv.style = "display: block";
          h3Div.style = "display: none";

          mapDiv.style = "display: none";  
      });

  } catch (error) {
      console.error("An error occurred while fetching the data:", error);
  }
}

// Call the function to fetch data when the page loads
window.onload = fetchUFData;
