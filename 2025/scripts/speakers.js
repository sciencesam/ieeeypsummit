document.addEventListener('DOMContentLoaded', function () {
    fetch('../speakers.json') // corrected path
        .then(response => {
            if (!response.ok) throw new Error('Network response not ok.');
            return response.json();
        })
        .then(speakers => {
            const container = document.getElementById('speakers-list');

            speakers.forEach(speaker => {
                const formattedAbstract = speaker.abstract
                    .split('\n\n')
                    .map(paragraph => `<p>${paragraph}</p>`)
                    .join('');

                const speakerHTML = `
                    <div class="speaker-card">
                        <img src="../resources/speakerpictures/${speaker.photo}" alt="${speaker.name}" 
                             onerror="this.onerror=null;this.src='https://via.placeholder.com/150';">
                        <h3>${speaker.name}</h3>
                        <h4>${speaker.affiliation}</h4>
                        <h5>${speaker.title}</h5>
                        <div class="abstract">${formattedAbstract}</div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', speakerHTML);
            });
        })
        .catch(error => {
            console.error('Error loading speakers:', error);
            document.getElementById('speakers-list').innerHTML = '<p>Error loading speaker data.</p>';
        });
});
