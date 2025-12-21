import React from 'react';

const LandingPage = () => {
  return (
    <main className="landing-page">

      {/* Japanese philosopy, Matsuo Basho's philosopy, Basho brand founders and Basho brand  philosophy */}
      <section>

        {/* Japanese philosophy, and Matsuo Basho's philosophy */}
        <div>
          <div className="heading">
            <h2>The Beauty of Impermanence</h2>
            <p>Philosophy & Aesthetics</p>
          </div>
          <p>
            At the heart of Japanese culture lies <i>Wabi-sabi</i>—a 
            worldview centered on the acceptance of transience and imperfection. 
            It is a beauty that is <i>imperfect, impermanent, and incomplete</i>.
          </p>
          <p>
            In our pottery, this manifests as a celebration of the artisan’s touch. 
            The slight asymmetry of a hand-thrown bowl or the unpredictable crackle 
            of a kiln’s glaze are not flaws, but the marks of a living object.
          </p>
          
          <div className="heading">
            <h2>The Way of the Wanderer</h2>
            <p>The Spirit of Matsuo Bashō</p>
          </div>

          <p>
            <i>Matsuo Bashō</i>, the 17th-century haiku master, viewed life as a journey 
            and art as a bridge to the eternal.
          </p>
          <p>
            His philosophy, <i>Fueki-Ryuko</i>, 
            reminds us that true art balances the timeless with the ephemeral.
          </p>
          <p>
            He taught the concept of <i>Karumi</i> (lightness)—finding 
            the profound within the ordinary. It is the <i>same lightness we aim to 
            bring to your table</i>.
          </p>
          <p>
            Through Bashō’s eyes, we learn that a simple morning tea is a 
            poem in motion, and every cup is a sanctuary.
          </p>
        </div>

        {/* Basho Founders image and their names, Basho logo and brand philosophy */}
        <div>
          <div className="brand-logo">
            <img src="/brand/logo-basho-byy-shivangi.png" />
            <div>
              Basho is a pottery and tableware brand inspired by Japanese culture and the philosophy of the Japanese poet Matsuo Bashō. The brand focuses on handcrafted, raw, earthy ceramic pieces including custom and ready-made tableware, workshops, studio experiences, and curated cultural events
            </div>  
          </div>
          <div className="brand-founder">
            <img src="/brand/founder.jpg" />
            <p>The founder - Shivangi</p>
          </div>
          <div>

          </div>
        </div>
      </section>
      
      <div>Explore our Collections</div>

      {/* Explore section */}
      <section>
        {/* Tableware poducts container showing related images, serve as link to products search page */}
        <div>
          
        </div>

        {/* Custom poducts container showing related images, serve as link to gallery of custom page*/}
        <div>
          
        </div>
        
        {/* Hosted wrokshops photographs, serve as link to gallery of more photographs*/}
        <div>
          
        </div>

        {/* Hosted cultural events photographs, serve as a link to gallery of more photographs*/}
        <div>

        </div>
      </section>
    </main>
  );
};

export default LandingPage;