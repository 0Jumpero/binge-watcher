// Settings for TMDB API calls, replace the API-Read-Access-Token with the one you got
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer API-Read-Access-Token'
  }
}

// Switch between movies and shows
function nav(tab){
  const movies = document.getElementsByClassName("bar-button")[0];
  const shows = document.getElementsByClassName("bar-button")[1];
  const pill = document.getElementsByClassName("bar-pill")[0];
  
  if(tab){
    movies.classList.remove("bar-active");
    shows.classList.add("bar-active");
    pill.style.left = "50%";
  }else{
    movies.classList.add("bar-active");
    shows.classList.remove("bar-active");
    pill.style.left = "0%";
  }

  // Refresh search results 
  search(document.getElementsByClassName("bar-search")[0].value);
}

// Calculation of runtume
async function runtime(id, seasons, runtime){
  // If calculating a movie, return runtime from API
  if(runtime){
    let h = Math.floor(runtime/60);
    let m = runtime - h * 60;
    return `<h1>${(h)?h+"h ":""}${(m)?m+"min":""}</h1>`;
  }
 
  let total = 0;
  let buttons = "";
  let h, m, d;
  runtime = 0;

  // If calculating a show loop through seasons
  for(let i=1; i<=seasons; i++){
    let res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${i}`, options);
    res = await res.json();

    // Loop through episodes and add up season runtime and total runtime
    for(let episode of res.episodes) runtime += episode.runtime;
    total += runtime;
    // Create buttons for seasons with separate runtimes
    d = Math.floor(runtime/60/24);
    h = Math.floor(runtime/60) - d * 24;
    m = runtime - h * 60;
    runtime = `${(d)?d+'d ':''}${(h)?h+'h ':''}${(m)?m+'min':''}`;
    buttons += `<span onclick="updateRuntime('${runtime}', this)">${i}</span> `;
    runtime = d = h = m = 0;
  }

  // Return buttons with total and seasonal runtime
  d = Math.floor(total/60/24);
  h = Math.floor(total/60 - d*24) ;
  m = total - h*60 - d*24*60;
  total = `${(d)?d+'d ':''}${(h)?h+'h ':''}${(m)?m+'min':''}`;
  return `<h2 style="text-align: center;">Seasons: <span id="total" onclick="updateRuntime('${total}', this)">All</span> ${buttons}</h2><h1 id="runtime"><h1>`
}

// Updater for selected season runtime
function updateRuntime(runtime, span){
  document.getElementById('runtime').innerHTML = runtime;
  for(let b of document.getElementsByTagName('span')) b.style.color = "";
  span.style.color = "rgb(64,64,255)";
}

// Display selected movie/show details 
async function select(id, tab){

  const content = document.getElementsByClassName("content")[0];
  let url = ['https://api.themoviedb.org/3', tab, id];
  let res = await fetch(url.join('/'), options);
  res = await res.json();

  let title = (res.original_name) ? res.original_name : res.original_title;
  let release = res.genres[0].name + "  " + ((tab == "movie") ? ( res.release_date.split("-")[0] ) : ( res.first_air_date.split("-")[0] + "-" + res.last_air_date.split("-")[0] ));
  let backdrop = (res.backdrop_path) ? ("https://image.tmdb.org/t/p/original" + res.backdrop_path) : "";

  content.innerHTML = 
  `<div class="content-details">
    <div class="content-details-backdrop" style="background-image: url(${backdrop}">
      <div class="content-details-text" id="details">
        <h2>${title}</h2>
        <p>${release}
          <br>
          Score: ${res.vote_average}
        </p>
        <br>
        <p>
          <b>Summary:</b>
          <br>
          ${res.overview}
        </p>
        <br><br><br><br>
        <h1>Runtime</h1>
      </div>
    </div>
  </div>`;

  // Add runtime after calculation
  document.getElementById("details").innerHTML += (tab == "movie") ? await runtime(id, null, res.runtime) : await runtime(id, res.number_of_seasons, null);
  // Select total runtime by default 
  document.getElementById("total").click();
}

// Display movies/shows
async function search(query){
  const content = document.getElementsByClassName("content")[0];
  const tab = (document.getElementsByClassName('bar-button')[0].classList.contains('bar-active')) ? 'movie': 'tv';

  let url = `https://api.themoviedb.org/3/search/${tab}?query=${query}`;
  let poster, title;
  
  let res = await fetch(url, options);
  res = await res.json();
  content.innerHTML = "";
  for(let e of res.results){
    title = (e.original_name) ? e.original_name : e.original_title;
    poster = (e.poster_path) ? "https://image.tmdb.org/t/p/original" + e.poster_path : "";
    content.innerHTML += 
      `<div class="content-result" style="background-image: url(${poster})" onclick="select(${e.id}, '${tab}')">
        <div class="content-result-title">${title}</div>
      </div>`;
  }
}
