import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap'; 
import '../styles/stationery.css';
import SearchIcon from '../searchIcon';
import Loading from './Loading';
import { useInfiniteQuery } from '@tanstack/react-query'
import {useInView} from 'react-intersection-observer';

const productWidth = 160 + 20;  
const productHeight = 200 + 20; 

const ProductGrid = () => {
  const nameref = useRef(null);
  const imgref = useRef(null);
  const buyingpriceref = useRef(null);
  const sellingpriceref = useRef(null);
  const quantref = useRef(null);
  const addQtyRef = useRef(null);
  const addBuyingPrice = useRef(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddQuantityModal, setShowAddQuantityModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedSubTypes, setSelectedSubTypes] = useState({});
  const [subTypesToRender, setSubTypesToRender] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchIntermediateTerm, setIntermediateSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    type: 'all',
    subtypes: {}
  });




  const Subtypes = [
   
    {"InkType":["Ball","Gel"]},
    {"Color":["Red","Blue","Green","Black"]},
    {"PencilType":["Mechanical","Graphite"]},
    {"Grade":["2B","3B","HB"]},
    {"Lead Size":[".7mm",".9mm"]},
    {"Ruler Type":["Plastic","Steel"]},
    {"Ruler Length":["15cm","30cm"]},
    {"Pages":["100","200"]},
    {"Ruling":["Ruled","Unruled"]},
    {"Size":["King Size","Long"]},


  ];
  const types = ["Pen","Pencil","Ruler","Eraser","Sharpner","Whitener","Notebook"];
  const typeDependencies = [
    {"Pen":["InkType","Color"]},
    {"Pencil":["PencilType"]},
    {"PencilType":["Mechanical","Graphite"]},
    {"Mechanical":["Lead Size"]},
    {"Graphite":["Grade"]},
    {"Ruler":["Ruler Type","Ruler Length"]},
    {"Notebook":["Pages","Ruling","Size"]},

  ];

  
  
 async function fetchProducts({ pageParam = 1, queryKey }) {
  const [_key, { appliedFilters, searchTerm, productsPerPage }] = queryKey;
  console.log(_key);

  const queryParams = new URLSearchParams({
    page: pageParam,
    limit: productsPerPage,
    searchName: searchTerm,
    filters: JSON.stringify(appliedFilters),
  });

  try{
  const response = await axios.get(
    `${process.env.REACT_APP_BACKEND_URL}/api/product/available?${queryParams.toString()}`
  );

  const productsWithImageUrl = await Promise.all(
    response.data.products.map(async (product) => {
      try {
        const imgResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/product/${product._id}/image`,
          { responseType: "blob" }
        );
        const imageUrl = URL.createObjectURL(imgResponse.data);
        return { ...product, img: imageUrl };
      } catch {
        return { ...product, img: null }; // fallback if image fetch fails
      }
    })
  );
  

  return {
    products: productsWithImageUrl,
    nextPage: productsWithImageUrl.length > 0 ? pageParam + 1 : undefined,
  };
  } catch (err) {
    // setsuccessStatus(false);
    // setMsg("Unable to fetch products");
    // setShowPopup(true);
  }
}


const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  status,
} = useInfiniteQuery({
  queryKey: ["products", { appliedFilters, searchTerm, productsPerPage: Math.floor(windowWidth / productWidth) * Math.floor(windowHeight / productHeight) }],
  queryFn: fetchProducts,
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
  

  const { ref, inView } = useInView({
    threshold: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  },[inView, hasNextPage, isFetchingNextPage, fetchNextPage]);


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  


  const handleApplyFilters = () => {
    setAppliedFilters({ type: selectedType, subtypes: selectedSubTypes });
    
    setShowFilters(false);
    
  };
  

  const handleResetFilters = () => {
    setSelectedType('all');
    setSelectedSubTypes({});
    setSubTypesToRender([]);
    setSearchTerm('');
    setIntermediateSearchTerm('');
    setAppliedFilters({ type: 'all', subtypes: {} });
    setShowFilters(false);
    
  };

  const handleSearch = () => {

    if (searchIntermediateTerm.trim() === '') {
      setSearchTerm('');
    } else {
      setSearchTerm(searchIntermediateTerm.trim());
    }
    
  };


  const updateSubTypesToRender = (type) => {
    
    if (type === 'all') {
      // setSubTypesToRender([]);
      // console.log("No subtypes for 'all'");
      return;
    }
  
    const subTypes = [];
    let subTypesReturned = [];
    
    // let typeDependency = null;
    typeDependencies.forEach((obj) => {
      if (obj[type]) {
        // console.log("Found type in typeDependencies:", type, obj[type]);
  
        obj[type].forEach((subType) => {
          const subtypeObj = Subtypes.find(sub => sub[subType]);
          if (subtypeObj) {
            // console.log("Found subType in Subtypes:", subType, subtypeObj[subType]);
  
           
            subTypes.push(subType);
          }
          else if(typeDependencies.find(sub=>sub[subType])){
             subTypesReturned  =  updateSubTypesToRender(subType);
          }
        });
      }
    });
  
    // console.log("Final subTypesToRender:", subTypes);
    console.log("subTypesToRender1",subTypesToRender);
    // setSubTypesToRender(prevItems => [...prevItems,...subTypes]);
    return [...subTypes,...subTypesReturned];
  };

  
  const handleSubTypeChange = (subType, value) => {
    console.log("selectedSubTypes",selectedSubTypes);
    setSelectedSubTypes(prevSubTypes => {
      
      const selectedToRemove = prevSubTypes[subType];
      console.log("selectedToRemove",selectedToRemove);
  
      
      const subTypesToRemove = [];
      const findChildren = (currentSubType) => {
        typeDependencies.forEach(dep => {
          if (dep[currentSubType]) {
            console.log("dep:",dep[currentSubType]);
            dep[currentSubType].forEach(child => {
              console.log(child);
              subTypesToRemove.push(child);
              // findChildren(child); // Recursively find further children
            });
          }
        });
      };
      
      if (selectedToRemove) {
        
        findChildren(selectedToRemove);
      }
      console.log("subTypesToRemove",subTypesToRemove);
      
      
      const newSubTypes = { ...prevSubTypes };
      subTypesToRemove.forEach(type => {
        delete newSubTypes[type];
      });
      console.log("subTypesToRender",subTypesToRender);
      const newSubTypesToRender = subTypesToRender.filter(
        (subtype) => !subTypesToRemove.includes(subtype)
      );
      
      console.log("newSubTypesToRender",newSubTypesToRender);
      // console.log(subTypesToRender);
      setSubTypesToRender([...newSubTypesToRender,...updateSubTypesToRender(value)]);
      
      if (value !== 'all') {
        newSubTypes[subType] = value;
      }
      console.log(newSubTypes);
      return newSubTypes;
    });
  
    
    // updateSubTypesToRender(value);
  };
  const renderSubtypes = (subType) => {
    const subtypeOptions = Subtypes.find(sub => sub[subType]);
    const options = subtypeOptions ? subtypeOptions[subType] : [];
  
    return (
      <Form.Group controlId={subType}>
        <Form.Label>{subType}:</Form.Label>
        <Form.Select
          id={subType}
          onChange={(e) => {
            
            handleSubTypeChange(subType, e.target.value);
            
          }}
        >
          <option value="all">All</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Form.Select>
        </Form.Group>
    );
  };
  
  const addProduct = async () => {
    try {
      
      const name = nameref.current.value.trim();
      const type = selectedType;
      const subtypes = selectedSubTypes;
      const buyingprice = buyingpriceref.current.value.trim();
      const sellingprice = sellingpriceref.current.value.trim();
      const quantity = quantref.current.value.trim();

      if (!name || !sellingprice || !quantity || !type ) {
        console.error('Name, selling price, and quantity are required.');
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      if (imgref.current.files[0]) {
        formData.append('img', imgref.current.files[0]);
      }
      formData.append('quantity', quantity);
      formData.append('sellingprice', sellingprice);
      formData.append('buyingprice', buyingprice);
      formData.append('type', type);
      formData.append('subtypes', JSON.stringify(subtypes));
      
      const token = JSON.parse(localStorage.getItem('adminToken'));
      if (!token) {
        console.error('Authorization token not found');
        return;
      }
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/product/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      fetchProducts();
      setShowAddProductModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const addQuantity = async (id) => {
    try {
      const additionalQuantity = addQtyRef.current.value.trim();
      const buyingprice = addBuyingPrice.current.value.trim();
      if (!additionalQuantity || !buyingprice) {
        console.error('Additional quantity and buying price are required.');
        return;
      }

      const updatedProduct = {
        quantity: additionalQuantity,
        buyingprice
      };

      const token = JSON.parse(localStorage.getItem('adminToken'));
      if (!token) {
        console.error('Authorization token not found');
        return;
      }
      await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/api/product/${editingProduct._id}/quantity`, updatedProduct, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchProducts();
      setShowAddQuantityModal(false);
    } catch (error) {
      console.error('Error adding quantity:', error);
    }
  };

  const saveEdit = async (id) => {
    try {
      const updatedProduct = {
        _id : id,
        name: nameref.current.value.trim(),
        type: selectedType,
        subtypes: JSON.stringify(selectedSubTypes),
        sellingprice: sellingpriceref.current.value.trim(),
        // quantity: quantref.current.value.trim(),
        // img: editingProduct.img
      };

      const token = JSON.parse(localStorage.getItem('adminToken'));
      if (!token) {
        console.error('Authorization token not found');
        return;
      }
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/product/${editingProduct._id}`, updatedProduct, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchProducts();
      setShowEditModal(false);
      resetForm();
      
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const resetForm = () => {
    nameref.current.value = '';
    setSelectedType('all');
    setSelectedSubTypes([]);
    imgref.current.value = null;
    quantref.current.value = '';
    sellingpriceref.current.value = '';
    buyingpriceref.current.value = '';
  };

  return (
    <div className='children'>
      <h1>Product Grid</h1>
      <div className="add-product-btn">
        
      <Button className="btn-1" onClick={() => setShowAddProductModal(true)}>Add New Product</Button>
      </div>
      <div className="search-and-filter-div">
        <div className="filter-div">
          <button
            id="filter-btn"
            onClick={() => setShowFilters(true)}
          >
            Filter
          </button>
        </div>
        <div className="search-product-div">
          <input
            type="text"
            placeholder="Search by name"
            value={searchIntermediateTerm}
            onChange={(e) => setIntermediateSearchTerm(e.target.value)}
            className="search-product-input"
          />
          <button onClick={handleSearch} id="search-product-btn" className="search-product-btn">
            <SearchIcon />
          </button>
        </div>
      </div>
      <Modal show={showFilters} onHide={() => setShowFilters(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Filter Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="type-filter">Type:</label>
            <Form.Select
              id="type-filter"
              value={selectedType}
              onChange={
                (e) => {setSelectedType(e.target.value);
                  setSubTypesToRender([]);
                  setSelectedSubTypes({});
                  setSubTypesToRender(updateSubTypesToRender(e.target.value));
                  
                }

              }
            >
              <option value="all">All</option>
              {/* {console.log(types)} */}
              {types.map((type) => (
                <option key={type} value={type}>
                  {/* {console.log(subTypesToRender)} */}
                  {type}
                </option>
              ))}
            </Form.Select>
          </div>
          {selectedType !== 'all' &&
      subTypesToRender.map((subType) => renderSubtypes(subType))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleResetFilters}>
            Reset
          </Button>
          <Button variant="primary" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>
      {
        data?.pages.map((page)=>{
          return <div key={page.nextPage - 1} className="product-grid">
        {page.products.map(product => (
          <div key={product._id} className="product-card">
            <img src={product.img} alt={product.name} className='product-img' />
            <p>Name: {product.name}</p>
            <p>Type: {product.type}</p>
            <p>Subtype: {Object.values(product.subtypes).join(', ')}</p>
            <p>Quantity: {product.quantity}</p>
            <p>Price: {product.sellingprice}</p>
            <div className='product-btn-container'>
            <Button className='btn-1 edit-btn' onClick={() => handleEdit(product)}>Edit</Button>
            <Button className='btn-1 add-quantity-btn' onClick={() => { setEditingProduct(product); setShowAddQuantityModal(true);setSelectedType(editingProduct?.type);
            setSelectedSubTypes(editingProduct?.subtypes); }}>Add Quantity</Button>
            </div>
            
          </div>
        ))}
      </div>
        })
      }
            <div ref={ref}></div>

      {
        status === "pending"?(<Loading/>):(<></>)
      }
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formProductName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" defaultValue={editingProduct?.name} ref={nameref} />
            </Form.Group>
            
            
            <Form.Group controlId="formProductType">
              <Form.Label>Type</Form.Label>
              <Form.Select value={selectedType} onChange={
                (e) => {setSelectedType(e.target.value);
                  setSubTypesToRender([]);
                  setSelectedSubTypes({});
                  setSubTypesToRender(updateSubTypesToRender(e.target.value));
                  
                }

              }>
                <option value="all">All</option>
                {types.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
                </Form.Select>
                
              
            </Form.Group>
            {selectedType !== 'all' &&
      subTypesToRender.map((subType) => renderSubtypes(subType))}
            <Form.Group controlId="formProductPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control type="text" defaultValue={editingProduct?.sellingprice} ref={sellingpriceref} />
            </Form.Group>
            <Button className='btn-1' style={{marginBottom:'.2rem'}} onClick={()=>{saveEdit(editingProduct?._id)}}>Save</Button>
            <Button className='btn-1 cancel-btn' onClick={() => setShowEditModal(false)}>Cancel</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showAddQuantityModal} onHide={() => setShowAddQuantityModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Quantity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formAddQuantity">
              <Form.Label>Additional Quantity</Form.Label>
              <Form.Control type="text" placeholder="Enter quantity to add" ref={addQtyRef} />
            </Form.Group>
            <Form.Group controlId="formAddQuantityBuyingPrice">
              <Form.Label>Buying Price</Form.Label>
              <Form.Control type="text" placeholder="Enter the buying price " ref={addBuyingPrice} />
            </Form.Group>
            <Button className='btn-1' onClick={addQuantity}>Add Quantity</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showAddProductModal} onHide={() => setShowAddProductModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formProductName">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" accept="image/*" ref={imgref} />
            </Form.Group>
            <Form.Group controlId="formProductName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Enter product name" ref={nameref} />
            </Form.Group>
            
            <Form.Group controlId="formProductType">
              <Form.Label>Type</Form.Label>
              <Form.Select value={selectedType} onChange={
                (e) => {setSelectedType(e.target.value);
                  setSubTypesToRender([]);
                  setSelectedSubTypes({});
                  setSubTypesToRender(updateSubTypesToRender(e.target.value));
                  
                }

              }>
                <option value="all">All</option>
                {types.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
                </Form.Select>
                
              
            </Form.Group>
            {selectedType !== 'all' &&
      subTypesToRender.map((subType) => renderSubtypes(subType))}
            <Form.Group controlId="formProductQuantity">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="text" placeholder="Enter product quantity" ref={quantref} />
            </Form.Group>
            <Form.Group controlId="formProductBuyingPrice">
              <Form.Label>Buying Price</Form.Label>
              <Form.Control type="text" placeholder="Enter buying price" ref={buyingpriceref} />
            </Form.Group>
            <Form.Group controlId="formProductSellingPrice">
              <Form.Label>Selling Price</Form.Label>
              <Form.Control type="text" placeholder="Enter selling price" ref={sellingpriceref} />
            </Form.Group>
            <Button className='btn-1'style={{marginBottom:'.2rem'}} onClick={addProduct}>Add New Product</Button>
            <Button className='btn-1 cancel-btn' onClick={() => setShowAddProductModal(false)}>Cancel</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductGrid;
