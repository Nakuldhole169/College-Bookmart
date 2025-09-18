import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Modal, Button,Form } from 'react-bootstrap';
import Loading from './Loading';
import SearchIcon from '../searchIcon';
import RightArrow from '../rightArrow';
import Popup from './popup';
import '../styles/stationery.css';
import { useInfiniteQuery } from '@tanstack/react-query'
import {useInView} from 'react-intersection-observer';

function StationeryPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [successStatus, setsuccessStatus] = useState(false);
  const [msg, setMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [searchIntermediateTerm, setIntermediateSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubTypes, setSelectedSubTypes] = useState({});
  const [subTypesToRender, setSubTypesToRender] = useState([]);
  const[showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    type: 'all',
    subtypes: {}
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const productWidth = 160 + 20;  
const productHeight = 200 + 20; 
  const navigate = useNavigate();

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
    setsuccessStatus(false);
    setMsg("Unable to fetch products");
    setShowPopup(true);
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
    console.log(`${process.env.REACT_APP_BACKEND_URL}`)
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

 

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
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

  const handleAddToCart = (product) => {
    const { name, sellingprice, _id, type, subtypes } = product;

    const existingItemIndex = cart.findIndex((item) => item.name === name && item.type === type && item.subtypes === subtypes);

    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      const newCartItem = {
        name,
        quantity: 1,
        price: sellingprice,
        _id,
        type_: type,
        subtypes,
      };
      const updatedCart = [...cart, newCartItem];
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const handleIncrementQuantity = (productId) => {
    const updatedCart = cart.map((item) =>
      item._id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleDecrementQuantity = (productId) => {
    const updatedCart = cart
      .map((item) =>
        item._id === productId
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 0 }
          : item
      )
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const DisplayProductImage = ({ productId,productName, img }) => {
    const [imageLoading, setimageLoading] = useState(!img);

    useEffect(() => {
      if (!img) {
        
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/product/${productId}/image`, {
            responseType: 'blob',
          })
          .then((response) => {
           
            setimageLoading(false);
          })
          .catch((error) => {
            setimageLoading(false);
          });
      } else {
        setimageLoading(false);
      }
    }, [productId, img]);

    return imageLoading ? (
      <div>
        <Loading />
      </div>
    ) : (
      <img
        src={img}
        alt={productName}
        className="product-card-img"
      />
    );
  };


  const updateSubTypesToRender = (type) => {
   
    
    if (type === 'all') {
      
      return;
    }
  
    const subTypes = [];
    let subTypesReturned = [];
    
    // let typeDependency = null;
    typeDependencies.forEach((obj) => {
      if (obj[type]) {
        
  
        obj[type].forEach((subType) => {
          const subtypeObj = Subtypes.find(sub => sub[subType]);
          if (subtypeObj) {
            
  
           
            subTypes.push(subType);
          }
          else if(typeDependencies.find(sub=>sub[subType])){
             subTypesReturned  =  updateSubTypesToRender(subType);
          }
        });
      }
    });
  
    
    return [...subTypes,...subTypesReturned];
  };

  
  const handleSubTypeChange = (subType, value) => {
    setSelectedSubTypes(prevSubTypes => {
      
      const selectedToRemove = prevSubTypes[subType];
  
      
      const subTypesToRemove = [];
      const findChildren = (currentSubType) => {
        typeDependencies.forEach(dep => {
          if (dep[currentSubType]) {
            dep[currentSubType].forEach(child => {
              subTypesToRemove.push(child);
            });
          }
        });
      };
      
      if (selectedToRemove) {
        
        findChildren(selectedToRemove);
      }
     
      
      
      const newSubTypes = { ...prevSubTypes };
      subTypesToRemove.forEach(type => {
        delete newSubTypes[type];
      });
       
      const newSubTypesToRender = subTypesToRender.filter(
        (subtype) => !subTypesToRemove.includes(subtype)
      );
      
      
      setSubTypesToRender([...newSubTypesToRender,...updateSubTypesToRender(value)]);
      
      if (value !== 'all') {
        newSubTypes[subType] = value;
      }
      
      return newSubTypes;
    });
  
    
    
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
  
  

 

  return (
    <div className='children'>
      <div className="search-and-filter-div">
        <div className="filter-div">
          <button
            id="filter-btn"
            onClick={() => setShowFilters(true)}
          >
            Filter
          </button>
        </div>
        <div className="search-div">
          <input
            type="text"
            placeholder="Search by name"
            value={searchIntermediateTerm}
            onChange={(e) => setIntermediateSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} id="search-btn" className="search-btn">
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
              {types.map((type) => (
                <option key={type} value={type}>
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
     
        <div>
          <div >
            {data?.pages.map((page)=>{
              // console.log(page.nextPage - 1)

              return <div key={page.nextPage - 1} className='product-list'>
                <div className='product-grid'>
                  {page.products.map((product) => (
              <div key={product._id} className="product-card">
                <DisplayProductImage
                  productId={product._id}
                  productName={product.name}
                  img={product.img} 
                />
                <div>
                  <p>{product.name}</p>
                  <b>
                    <p>Rs. {product.sellingprice}</p>
                  </b>
                  <p className="type-text">
                    {product.type}
                    </p>
                    <p className='subtype-text'>({Object.values(product.subtypes).join(', ')})</p>
                  
                </div>
                <div
                  style={{
                    height: '',
                    alignItems: 'center',
                    paddingBottom: '0%',
                  }}
                >
                  {cart.find((item) => item._id === product._id) ? (
                    <div className="quantity-controls">
                      <button
                        className="product-subtract-btn"
                        onClick={() => handleDecrementQuantity(product._id)}
                      >
                        -
                      </button>
                      <span className="quantity-disp">
                        <p>{cart.find((item) => item._id === product._id)?.quantity}</p>
                      </span>
                      <button
                        className="product-add-btn"
                        onClick={() => handleIncrementQuantity(product._id)}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      id="add_btn"
                      onClick={() => handleAddToCart(product)}
                      className="btn-1"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
                  </div>
              </div>
              
            })}
            <div ref={ref}></div>
          </div>
          
        </div>
        {status === "pending"?(<Loading/>):(<></>)}
      
      {cart.length > 0 && (
        <div className="cart-button-container">
          <button
            className="btn-1 cart-button"
            onClick={() => navigate('/cart')}
          >
            Go to Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
            <RightArrow />
          </button>
        </div>
      )}
      {showPopup && (
        <Popup
          message={msg}
          onClose={()=>{setShowPopup(false)}}
          status={successStatus}
          doRedirect={false}
        />
      )}
    </div>
  );
}

export default StationeryPage;
