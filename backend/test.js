async function testEdit() {
  try {
    const res = await fetch('http://localhost:5001/api/blogs');
    const blogs = await res.json();
    const blog = blogs[0];
    console.log('Editing blog:', blog._id);
    
    const updateRes = await fetch(`http://localhost:5001/api/blogs/${blog._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: blog.title + ' (Edited)',
        content: blog.content,
        imageUrl: blog.imageUrl
      })
    });
    
    const updateData = await updateRes.json();
    console.log('Update status:', updateRes.status);
    console.log('Update successful:', updateData.title);
  } catch (error) {
    console.error('Update failed:', error);
  }
}

testEdit();
