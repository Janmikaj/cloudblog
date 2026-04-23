require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Blog = require('./models/Blog');
const Comment = require('./models/Comment');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vulnerable_blog';

// Helper function to generate approximately 300 words of meaningful filler per call
const generateParagraph = (topic, index) => {
  const openers = [
    "In the modern era of software engineering, teams are constantly evolving their strategies to overcome new challenges.",
    "This shift in paradigm necessitates a deep understanding of core concepts and a proactive approach to potential bottlenecks.",
    "Furthermore, the integration of advanced tools has significantly streamlined what was once a convoluted workflow.",
    "As we delve deeper into this subject, it becomes evident that careful planning is just as critical as the execution itself.",
    "Experts argue that without a solid foundation, even the most sophisticated systems can suffer from unforeseen vulnerabilities."
  ];
  
  const sentence = openers[index % openers.length];
  
  const chunk = `${sentence} ${topic} continues to be a focal point for organizations aiming to scale efficiently while maintaining robustness. When evaluating the impact of these technologies, one must consider both the immediate benefits and the long-term maintenance implications. Security, performance, and reliability are interconnected pillars that support the entire architecture. By adopting industry-standard practices, developers and operations teams can bridge the gap that historically led to siloed deployments. Continuous learning and adaptation are paramount in an ecosystem where changes happen at a breakneck pace. Therefore, understanding the nuances of ${topic} is not just an advantage, but a necessity for modern professionals. Furthermore, case studies from leading tech giants consistently demonstrate that embracing ${topic} yields substantial dividends in both time-to-market and overall product stability. As the technological landscape grows more complex, the principles surrounding ${topic} will only become more fundamental to our daily operations. It requires a dedicated commitment to ongoing education, rigorous testing, and an unyielding desire to improve existing paradigms. `;
  
  // Return the chunk repeated 3 times to make each section very long (approx 450 words per section)
  return `<p style="margin-bottom: 1.5rem; line-height: 1.8;">${chunk.repeat(3)}</p>`;
};

// Generate full article (approx 1500+ words)
const generateArticle = (topic, imageUrl) => {
  let content = `<img src="${imageUrl}" alt="${topic}" style="width:100%; max-height:450px; object-fit:cover; border-radius:12px; margin-bottom: 30px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);" />`;
  
  content += `<h2 style="font-size: 2rem; color: #f8fafc; margin-top: 2rem; margin-bottom: 1rem;">1. Introduction to ${topic}</h2>`;
  content += generateParagraph(topic, 0);
  content += generateParagraph(topic, 1);
  
  content += `<h2 style="font-size: 2rem; color: #f8fafc; margin-top: 2rem; margin-bottom: 1rem;">2. Core Principles and Architecture</h2>`;
  content += generateParagraph(topic, 2);
  
  // Second image in the middle of the blog
  content += `<img src="${imageUrl}?auto=format&fit=crop&q=80&w=1000&random=1" alt="Architecture" style="width:100%; max-height:450px; object-fit:cover; border-radius:12px; margin: 30px 0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);" />`;
  
  content += `<h2 style="font-size: 2rem; color: #f8fafc; margin-top: 2rem; margin-bottom: 1rem;">3. Implementation Strategies</h2>`;
  content += generateParagraph(topic, 3);
  
  content += `<h2 style="font-size: 2rem; color: #f8fafc; margin-top: 2rem; margin-bottom: 1rem;">4. Common Pitfalls and How to Avoid Them</h2>`;
  content += generateParagraph(topic, 4);
  
  content += `<h2 style="font-size: 2rem; color: #f8fafc; margin-top: 2rem; margin-bottom: 1rem;">5. Conclusion</h2>`;
  content += generateParagraph(topic, 0);
  
  return content;
};

const topics = [
  { title: "The Rise of DevSecOps in Cloud Environments", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa" },
  { title: "Understanding Kubernetes Clusters for Beginners", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c" },
  { title: "A Deep Dive into React Performance Optimization", img: "https://images.unsplash.com/photo-1633356122544-f134324a6cee" },
  { title: "Securing Node.js Applications from XSS and Injection", img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c" },
  { title: "CI/CD Pipelines: Automating the Modern Workflow", img: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb" },
  { title: "Mastering MongoDB: Schema Design Best Practices", img: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d" },
  { title: "Zero Trust Architecture Explained", img: "https://images.unsplash.com/photo-1563206767-5b18f218e8de" },
  { title: "Docker Containers: Beyond the Basics", img: "https://images.unsplash.com/photo-1605745341112-85968b19335b" },
  { title: "The Evolution of Cloud Native Applications", img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d" },
  { title: "Penetration Testing Tools: ZAP, Burp, and More", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5" },
  { title: "The Future of AI in Web Development", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995" },
  { title: "Serverless Computing: Pros and Cons", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa" },
  { title: "Microservices vs Monoliths: A Practical Guide", img: "https://images.unsplash.com/photo-1558494949-ef010ca68a92" },
  { title: "GraphQL vs REST: Which one to choose in 2026?", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97" },
  { title: "Web Accessibility: Building Inclusive Applications", img: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c" }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Seeding detailed blog data...');

    // Clear existing data
    await User.deleteMany({});
    await Blog.deleteMany({});
    await Comment.deleteMany({});

    // Hash Strong Passwords
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@2026!', salt);
    const editorHash = await bcrypt.hash('Editor#Secure99', salt);
    const userHash = await bcrypt.hash('User$Pass42', salt);

    // Create Multiple Users with Emails and Strong Hashes
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@cloudblog.com',
      password: adminHash, 
      role: 'admin'
    });

    const editorUser = await User.create({
      username: 'editor',
      email: 'editor@cloudblog.com',
      password: editorHash, 
      role: 'editor'
    });

    await User.create({
      username: 'user',
      email: 'user@cloudblog.com',
      password: userHash, 
      role: 'user'
    });

    // Create Detailed Blogs
    for (let i = 0; i < topics.length; i++) {
      const item = topics[i];
      const blog = await Blog.create({
        title: item.title,
        content: generateArticle(item.title, item.img),
        imageUrl: item.img + "?auto=format&fit=crop&q=80&w=800",
        author: i % 2 === 0 ? adminUser.username : editorUser.username
      });
      
      // Add a couple of initial comments to each blog
      await Comment.create({
        blogId: blog._id,
        name: 'TechEnthusiast',
        comment: 'This is a fantastic read! The architecture section was especially detailed.'
      });
      await Comment.create({
        blogId: blog._id,
        name: 'SecurityPro',
        comment: 'Great overview, looking forward to the next part.'
      });
      
      console.log(`Seeded blog: ${item.title} (Author: ${blog.author})`);
    }

    console.log('10 Detailed Blogs seeded successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
