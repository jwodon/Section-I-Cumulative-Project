"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  console.debug("getAndShowStoriesOnStart");
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  const hostName = story.getHostName();

  const isFavorite = currentUser ? currentUser.isFavorite(story) : false;
  const starClass = isFavorite ? "fas fa-star" : "far fa-star";

  const isMyStory = currentUser ? currentUser.isMyStory(story) : false;
  const storyClass = isMyStory ? "fas fa-trash-alt my-story-trash" : "hidden"

  return $(`
      <li id="${story.storyId}">
        <i id="trash" class="${storyClass}"></i>
        <i id="star" class="${starClass}"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
      <hr>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  let storiesToDisplay = storyList.stories;

  // loop through all of our stories and generate HTML for them
  for (let story of storiesToDisplay) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// Function to render stories in "My Stories"
function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

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
}

async function submitNewStory() {

  //Grab data from inputs and assign to variable
  const author = $("#create-author").val();
  const title = $("#create-title").val();
  const url = $("#create-url").val();

  //Call addStory and put it on the page
  let newStory = await storyList.addStory(currentUser, { title, author, url });
  currentUser.ownStories.unshift(newStory);
  await getAndShowStoriesOnStart();

  //reset input field after submit and hide
  $("#create-author").val('');
  $("#create-title").val('');
  $("#create-url").val('')
  $submitForm.hide();
}

$(function() {
$submitFormButton.on("click", submitNewStory);
});


$('.stories-container').on('click', '.fa-star', async function(event) {
  event.preventDefault();
  const storyId = $(this).parent().attr('id');

  try {
    await currentUser.toggleFavorite(storyId);
    const isFavorited = currentUser.isFavoriteById(storyId);
    const starClass = isFavorited ? "fas fa-star" : "far fa-star";
    $(this).removeClass().addClass(starClass);
  } catch (error) {
    console.error("Error toggling favorite", error);
    alert("An error occurred while toggling favorite.");
  }

  // If favorites option is active, refresh stories on the page
  if ($navFavorite.hasClass("active")) {
    putStoriesOnPage();
  }
});


$('.stories-container').on('click', '.my-story-trash', async function(event) {
  event.preventDefault();
  const storyId = $(this).parent().attr('id');

  await axios.delete(
    `${BASE_URL}/stories/${storyId}`,
    { data: { token: currentUser.loginToken } }
  );

  //remove story from local storage
  currentUser.ownStories = currentUser.ownStories.filter(story => story.storyId !== storyId);
  $(this).parent().remove();
  putMyStoriesOnPage();
  
});






