function Landing() {
    return (
      <div style={{ fontFamily: "Verdana, sans-serif", padding: "20px" }}>
        {/* Navigation Bar */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            backgroundColor: "#E6E6FA", // Light purple
            padding: "10px 20px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontStyle: "italic", // Italicized
              fontWeight: "bold",
              color: "#000",
            }}
          >
            Fruition
          </div>
          <nav>
            <button style={buttonStyle}>Mission</button>
            <button style={buttonStyle}>Sign Up</button>
            <button style={buttonStyle}>Log In</button>
          </nav>
        </header>
  
        {/* Main Statement */}
        <div
          style={{
            fontSize: "4rem",
            textAlign: "center",
            color: "#000",
            marginTop: '80px',
            marginBottom: "80px",
            fontStyle: "italic", // Italicized main statement
          }}
        >
          Where Ideas Come to Fruition
        </div>
  
        {/* Features Section */}
        <section>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: index % 2 === 0 ? "row" : "row-reverse", // Alternate layout
                alignItems: "center",
                margin: "20px 0",
              }}
            >
              {/* Block Title and Button */}
              <div
                style={{
                  backgroundColor: "#E6E6FA", // Light purple background
                  padding: "20px",
                  borderRadius: "8px",
                  flex: "1",
                  textAlign: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: "2rem",
                    color: "#000",
                    fontStyle: "italic", // Italicized title
                  }}
                >
                  {feature.title}
                </h2>
                <button style={featureButtonStyle}>{feature.buttonText}</button>
              </div>
  
              {/* Bullet Points */}
              <div
                style={{
                  flex: "2",
                  textAlign: "left", // Left-align the text
                  marginLeft: index % 2 === 0 ? "20px" : "0", // Add spacing between blocks
                  marginRight: index % 2 !== 0 ? "20px" : "0", // Add spacing for reversed blocks
                  padding: "20px", // Added padding to center bullets
                  //backgroundColor: "#F8F8FF", // Optional: Light background to visually define the area
                  borderRadius: "8px", // Optional: Round edges for cleaner look
                }}
              >
                <ul style={bulletListStyle}>
                  {feature.items.map((item, idx) => (
                    <li key={idx} style={bulletItemStyle}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>
      </div>
    );
  }
  
  // Feature data with bullet points under each feature
  const features = [
    {
      title: "Let's Connect",
      buttonText: "Find Your Match",
      items: [
        "• Connect to faculty members on existing projects",
        "• Find a faculty advisor for a thesis or new project",
        "• Meet students to build independent projects with",
      ],
    },
    {
      title: "Let's Chat",
      buttonText: "Discover Forums",
      items: [
        "• Ask peers questions about your ongoing research",
        "• Propose new ideas and get feedback",
        "• Post surveys to gather data",
      ],
    },
    {
        title: "Let's Educate",
        buttonText: "Browse Resources",
        items: [
          "• Learn how to kick-start your research",
          "• Watch videos on research methodologies and best practices",
          "• Explore step-by-step guides to refine your project ideas",
        ],
      },
      {
        title: "Let's Find Funding",
        buttonText: "Apply to Grants",
        items: [
          "• Browse through a database of grants applicable to your research",
          "• Autofill your applications based on pre-entered information",
        ],
      },
      {
        title: "Let's Submit",
        buttonText: "Publish Your Research",
        items: [
          "• Explore through a list of publications customized for your project",
          "• Structure your paper seamlessly with built-in formatting",
        ],
      },
      {
        title: "Next Steps",
        buttonText: "Get Started",
        items: [
          "• Launch your project with an accelerator",
          "• File for disclosure to protect intellectual property",
        ],
      },
    // Add more feature blocks as needed
  ];
  
  // Reusable styles
  const buttonStyle = {
    margin: "0 10px",
    padding: "10px 20px",
    backgroundColor: "#A39BE8", // Faded indigo color
    color: "#FFF",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    fontFamily: "Lucida Grande, monospace",
  };
  
  const featureButtonStyle = {
    ...buttonStyle,
    marginTop: "10px",
  };
  
  const bulletListStyle = {
    listStyleType: "none", // Removes bullets for cleaner look
    margin: "0",
    padding: "0 20px", // Adds horizontal padding to shift bullets to the right
  };
  
  const bulletItemStyle = {
    fontSize: "1rem",
    color: "#000", // Black text for items
    marginBottom: "15px",
    textIndent: "20px", // Adds slight indentation for extra spacing
  };
  
  export default Landing;
  