// IMPORTS
// React
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
// Components
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';
import SearchForm from '../SearchForm/SearchForm';
import SavedNewsHeader from '../SavedNewsHeader/SavedNewsHeader';
import Main from '../Main/Main';
import Preloader from '../Preloader/Preloader';
import About from '../About/About';
import Footer from '../Footer/Footer';
import NewsCard from '../NewsCard/NewsCard';
import NewsCardList from '../NewsCardList/NewscardList';
import PopupWithForm from '../PopupWithForm/PopupWithForm';
import NotFound from '../NotFound/NotFound';
// APIs
import mainApi from '../../utils/MainApi';
import searchArticles from '../../utils/NewsApi';
// Contexts
import LoggedInContext from '../../contexts/LoggedInContext';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import SavedArticlesContext from '../../contexts/SavedArticlesContext';
// Protected Route
import ProtectedRoute from '../../utils/ProtectedRoute';

function App() {
  const [currentUser, setCurrentUser] = React.useState({});
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showResults, setShowResults] = React.useState(true);
  const [articles, setArticles] = React.useState([]);
  const [savedArticles, setSavedArticles] = React.useState([]);

  function getSavedArticles() {
    setIsLoading(true);

    mainApi
      .getArticles()
      .then((articles) => setSavedArticles(articles))
      .catch((err) => mainApi.reportError(err))
      .finally(() => setIsLoading(false));
  }

  React.useEffect(() => {
    const closeByEscape = (evt) => {
      if (evt.key === 'Escape') {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('keydown', closeByEscape);

    return () => document.removeEventListener('keydown', closeByEscape);
  }, []);

  React.useEffect(() => {
    if (localStorage.getItem('jwt')) {
      mainApi
        .getSelf()
        .then((user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
        })
        .catch((err) => mainApi.reportError(err));
    }
  }, []);

  React.useEffect(() => {
    getSavedArticles();
  }, []);

  return (
    <LoggedInContext.Provider value={isLoggedIn}>
      <CurrentUserContext.Provider value={currentUser}>
        <SavedArticlesContext.Provider value={savedArticles}>
          <div className='app'>
            <PopupWithForm
              isOpen={isPopupOpen}
              setIsOpen={setIsPopupOpen}
              signUpReq={mainApi.signUp.bind(mainApi)}
              signInReq={mainApi.signIn.bind(mainApi)}
              reportError={mainApi.reportError.bind(mainApi)}
            />
            <Switch>
              <ProtectedRoute path='/saved-news'>
                <SavedNewsHeader>
                  <Navbar
                    saved
                    setIsLoggedIn={setIsLoggedIn}
                    setIsOpen={setIsPopupOpen}
                  />
                </SavedNewsHeader>
                <Main
                  saved
                  isLoading={isLoading}
                  getSavedArticles={getSavedArticles}
                >
                  <Preloader saved />
                  <NewsCardList articles={savedArticles}>
                    <NewsCard
                      saved
                      removeReq={mainApi.removeArticle.bind(mainApi)}
                      reloadSavedArticles={getSavedArticles}
                      reportError={mainApi.reportError.bind(mainApi)}
                    />
                  </NewsCardList>
                  <NotFound saved />
                </Main>
              </ProtectedRoute>
              <Route path='/'>
                <Redirect to='/' />
                <Header>
                  <Navbar
                    setIsLoggedIn={setIsLoggedIn}
                    setIsOpen={setIsPopupOpen}
                  />
                  <SearchForm
                    searchReq={searchArticles}
                    setArticles={setArticles}
                    getSavedArticles={getSavedArticles}
                    setIsLoading={setIsLoading}
                    setShowResults={setShowResults}
                    reportError={mainApi.reportError.bind(mainApi)}
                  />
                </Header>
                {showResults && (
                  <Main isLoading={isLoading} articles={articles}>
                    <Preloader />
                    <NewsCardList
                      articles={JSON.parse(localStorage.getItem('articles'))}
                    >
                      <NewsCard
                        bookmarkReq={mainApi.saveArticle.bind(mainApi)}
                        removeReq={mainApi.removeArticle.bind(mainApi)}
                        reportError={mainApi.reportError.bind(mainApi)}
                        setIsPopupOpen={() => setIsPopupOpen(true)}
                        setArticles={setArticles}
                        getSavedArticles={getSavedArticles}
                      />
                    </NewsCardList>
                    <NotFound />
                  </Main>
                )}
                <About />
              </Route>
            </Switch>
            <Footer />
          </div>
        </SavedArticlesContext.Provider>
      </CurrentUserContext.Provider>
    </LoggedInContext.Provider>
  );
}

export default App;
