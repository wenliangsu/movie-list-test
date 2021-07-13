//Section parameter setting   //
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
// todo 設定新的變數
//note 在gobal設定page是為了讓當前需要用到分頁器的函式或是條件是都可用，這樣才可以作用於整個網頁，而非限定只用在某一個function中
let mode = 'cardMode'
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const arrange = document.getElementById('arrange')

//Section function setting    //
//todo JS匯入movie data(cardmode)
function renderMovieListCardMode(data) {
  let rawHTML = ``
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top"
                alt="Movie Poster"
              >
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-toggle="modal"
                  data-target="#movie-modal"
                  data-id="${item.id}"
                >
                  More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>`
  })

  dataPanel.innerHTML = rawHTML
}

//todo 匯入movie data (list mode) ==> 新增項目
function renderMovieListListMode(data) {
  let rawHTML = ``
  data.forEach((item) => {
    rawHTML += `
    <div class="list col-12 justify-content-between">
        <div class="row align-items-center" style="border-top: 1px rgb(199, 195, 195) solid">
          <div class="card-body movie-item-body">
            <span class="movie-title">${item.title}</span>
          </div>
          <div class="buttons">
            <button
                  class="btn btn-primary btn-show-movie"
                  data-toggle="modal"
                  data-target="#movie-modal"
                  data-id="${item.id}"
                >
                  More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

//todo 判斷list or carde 模式 ==> 新增項目
function arrangeMode() {
  const listPage = getMoviesByPage(currentPage)
  mode === 'cardMode' ? renderMovieListCardMode(listPage) : renderMovieListListMode(listPage)
}


//todo 分頁的總頁數呈現以及HTML的標籤重新導入
function renderPaginator(length) {
  //* movies 有80個 80/12 = 6 ... 8 (需要無條件進位，所以要7頁)
  const numberOfPages = Math.ceil(length / MOVIES_PER_PAGE)

  let rawHTML = ``

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `

    paginator.innerHTML = rawHTML
  }
}

//todo 電影總數拆分後的分頁
function getMoviesByPage(page) {
  //* movies ? "movie" : "filteredMovies"
  const data = filteredMovies.length ? filteredMovies : movies

  //*  12個分成一頁
  //* page 1 -> movie 0 ~ 11, page 2 -> movie 12 ~23, page 3 -> movie 24 ~ 45
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//todo 每個電影的訊息
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results

    // insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

//todo Add favorite movie list
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中!')
  }

  list.push(movie)
  console.log(list)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//Section      監聽器設置     //

//todo Change the card or list ==> 新增項目
arrange.addEventListener('click', function changeArrange(event) {
  if (event.target.matches('#card-arrange')) {
    mode = 'cardMode'
  } else if (event.target.matches('#list-arrange')) {
    mode = 'listMode'
  }
  arrangeMode()
})

//todo Movie info input and add the favorite
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    console.log(event.target.dataset)

    showMovieModal(Number(event.target.dataset.id))

    //* Add to favorite list
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//todo paginator setting ==> 修正頁數的變數區域
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  currentPage = Number(event.target.dataset.page)

  arrangeMode()
})

//todo Search bar setting
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
 // *** 取得搜尋的關鍵字
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with this keyword:' + keyword)
  }

  //*重新輸出至畫面
  renderPaginator(filteredMovies.length)
  renderMovieListCardMode(getMoviesByPage(1))
})

//Section API data setting    //
//todo movie data匯入
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    //* 分頁呼叫
    renderPaginator(movies.length)
    //* 分頁後的渲染呼叫
    // renderMovieListCardMode(getMoviesByPage(1))
    arrangeMode()
  })
  .catch((err) => console.log(err))
