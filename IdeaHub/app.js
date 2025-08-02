
        const ideasFeed = document.getElementById('ideas-feed');
        const submitModal = document.getElementById('submit-modal');
        const submitForm = document.getElementById('submit-form');
        const searchBar = document.getElementById('search-bar');
        const loadMoreButton = document.getElementById('load-more-button');
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');
        const submitIdeaButton = document.getElementById('submit-idea-button');
        const userStatusSpan = document.getElementById('user-status');
        const sortRecentButton = document.getElementById('sort-recent-button');
        const sortPopularButton = document.getElementById('sort-popular-button');

        let allIdeas = JSON.parse(localStorage.getItem('mockIdeas')) || [
            { id: '1', title: 'A better way to compost', description: 'Develop a smart bin that automatically sorts compostable materials.', upvotes: 10, timestamp: Date.now() - 50000000 },
            { id: '2', title: 'Real-time public transit maps', description: 'Create an app that shows live locations of all buses and trains.', upvotes: 5, timestamp: Date.now() - 30000000 },
            { id: '3', title: 'AI-powered study assistant', description: 'An intelligent chatbot that helps students with homework and exam prep.', upvotes: 25, timestamp: Date.now() - 10000000 },
            { id: '4', title: 'Solar-powered phone charger', description: 'A portable, compact phone charger that uses solar energy.', upvotes: 12, timestamp: Date.now() - 70000000 },
            { id: '5', title: 'Community garden management app', description: 'An app to manage plots, schedule watering, and share produce.', upvotes: 8, timestamp: Date.now() - 60000000 },
            { id: '6', title: 'Virtual reality museum tours', description: 'Immersive VR experiences to explore museums around the world.', upvotes: 15, timestamp: Date.now() - 40000000 }
        ];
        
        let upvotedIdeas = JSON.parse(localStorage.getItem('upvotedIdeas')) || {};
        let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        let visibleIdeasCount = 4;
        let currentIdeas = [];

        function saveIdeas() {
            localStorage.setItem('mockIdeas', JSON.stringify(allIdeas));
        }

        function saveUpvotes() {
            localStorage.setItem('upvotedIdeas', JSON.stringify(upvotedIdeas));
        }

        function renderIdeas(ideasToRender) {
            ideasFeed.innerHTML = '';
            ideasToRender.forEach(idea => {
                const ideaCard = document.createElement('div');
                ideaCard.style.border = '1px solid #ccc';
                ideaCard.style.padding = '15px';
                ideaCard.style.borderRadius = '8px';
                ideaCard.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

                ideaCard.innerHTML = `
                    <h3>${idea.title}</h3>
                    <p>${idea.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                        <span id="upvote-count-${idea.id}">Upvotes: ${idea.upvotes}</span>
                        <button class="upvote-button" data-id="${idea.id}" ${upvotedIdeas[idea.id] ? 'disabled' : ''}>Upvote</button>
                    </div>
                `;
                ideasFeed.appendChild(ideaCard);
            });
            addUpvoteButtonListeners();
        }

        function addUpvoteButtonListeners() {
            document.querySelectorAll('.upvote-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const ideaId = e.target.dataset.id;
                    handleUpvote(ideaId);
                });
            });
        }

        function updateAuthUI() {
            if (currentUser) {
                userStatusSpan.textContent = `Hello, User!`;
                loginButton.style.display = 'none';
                logoutButton.style.display = 'inline-block';
                submitIdeaButton.style.display = 'inline-block';
            } else {
                userStatusSpan.textContent = `Guest`;
                loginButton.style.display = 'inline-block';
                logoutButton.style.display = 'none';
                submitIdeaButton.style.display = 'none';
            }
        }

        function login() {
            currentUser = { uid: 'mockUserId123' };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthUI();
        }

        function logout() {
            currentUser = null;
            localStorage.removeItem('currentUser');
            updateAuthUI();
            upvotedIdeas = {};
            saveUpvotes();
            renderIdeas(currentIdeas);
        }

        function handleUpvote(ideaId) {
            if (!currentUser) {
                alert('You must be logged in to upvote an idea!');
                return;
            }
            if (upvotedIdeas[ideaId]) {
                return;
            }

            const ideaIndex = allIdeas.findIndex(idea => idea.id === ideaId);
            if (ideaIndex !== -1) {
                allIdeas[ideaIndex].upvotes++;
                saveIdeas();
                
                const upvoteCountSpan = document.getElementById(`upvote-count-${ideaId}`);
                if (upvoteCountSpan) {
                    upvoteCountSpan.textContent = `Upvotes: ${allIdeas[ideaIndex].upvotes}`;
                }
                
                upvotedIdeas[ideaId] = true;
                saveUpvotes();
                const upvoteButton = document.querySelector(`.upvote-button[data-id="${ideaId}"]`);
                if (upvoteButton) {
                    upvoteButton.disabled = true;
                }
            }
        }
        
        function showSubmitModal() {
            if (currentUser) {
                submitModal.style.display = 'flex';
            } else {
                alert('You must be logged in to submit an idea.');
            }
        }

        function closeSubmitModal() {
            submitModal.style.display = 'none';
            submitForm.reset();
        }

        function submitIdea(event) {
            event.preventDefault();
            const title = document.getElementById('idea-title').value;
            const description = document.getElementById('idea-description').value;

            const newIdea = {
                id: (Date.now() + Math.random()).toString(),
                title,
                description,
                upvotes: 0,
                timestamp: Date.now()
            };

            allIdeas.unshift(newIdea);
            saveIdeas();

            closeSubmitModal();
            updateFeed();
        }

        function updateFeed() {
            let filteredIdeas = [...allIdeas];
            const query = searchBar.value.toLowerCase();
            if (query) {
                filteredIdeas = filteredIdeas.filter(idea => 
                    idea.title.toLowerCase().includes(query) || 
                    idea.description.toLowerCase().includes(query)
                );
            }
            
            const sortBy = document.querySelector('#sort-recent-button.active') ? 'recent' : 
                            (document.querySelector('#sort-popular-button.active') ? 'popular' : 'recent');
            if (sortBy === 'popular') {
                filteredIdeas.sort((a, b) => b.upvotes - a.upvotes);
            } else {
                filteredIdeas.sort((a, b) => b.timestamp - a.timestamp);
            }

            currentIdeas = filteredIdeas.slice(0, visibleIdeasCount);
            renderIdeas(currentIdeas);

            if (visibleIdeasCount < filteredIdeas.length) {
                loadMoreButton.style.display = 'block';
            } else {
                loadMoreButton.style.display = 'none';
            }
        }
        
        submitForm.addEventListener('submit', submitIdea);
        submitIdeaButton.addEventListener('click', showSubmitModal);
        document.getElementById('close-modal-button').addEventListener('click', closeSubmitModal);
        loginButton.addEventListener('click', login);
        logoutButton.addEventListener('click', logout);
        
        let searchTimeout;
        searchBar.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                visibleIdeasCount = 4;
                updateFeed();
            }, 300);
        });

        loadMoreButton.addEventListener('click', () => {
            visibleIdeasCount += 4;
            updateFeed();
        });

        function handleSortClick(button, otherButton) {
            if (!button.classList.contains('active')) {
                button.classList.add('active');
                otherButton.classList.remove('active');
                visibleIdeasCount = 4;
                updateFeed();
            }
        }

        sortRecentButton.addEventListener('click', () => {
            handleSortClick(sortRecentButton, sortPopularButton);
        });
        sortPopularButton.addEventListener('click', () => {
            handleSortClick(sortPopularButton, sortRecentButton);
        });
        
        document.addEventListener('DOMContentLoaded', () => {
            updateAuthUI();
            updateFeed();
            sortRecentButton.classList.add('active');
        });