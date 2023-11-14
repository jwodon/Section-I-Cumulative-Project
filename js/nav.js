"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

async function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();

  //refresh story list when hit (to account for deleted stories, favorited, etc.)
  storyList = await StoryList.getStories();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function navSubmitClick() {
  $submitForm.show();
}

$navSubmit.on("click", navSubmitClick);


//event handler for my stories
$navMyStories.on('click', function () {
  $allStoriesList.empty();
  let storiesToDisplay = currentUser.ownStories;

  if (storiesToDisplay.length === 0) {
    $allStoriesList.append('<p>No stories added by user yet</p>');
  } else {
    for (let story of storiesToDisplay) {
      const $story = generateStoryMarkup(story);
      $allStoriesList.append($story);
    }
  }

  $allStoriesList.show();
});

//event handler for favorites
//display text if user has no favorite stories

$navFavorite.on('click', function () {
  $allStoriesList.empty();
  let storiesToDisplay = currentUser.favorites;

  if (storiesToDisplay.length === 0) {
    $allStoriesList.append('<p>No favorites added</p>');
  } else {
    for (let story of storiesToDisplay) {
      const $story = generateStoryMarkup(story);
      $allStoriesList.append($story);
    }
  }

  $allStoriesList.show();
});
