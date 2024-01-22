import React, { useEffect, useRef, useState } from 'react'

import 'firebase/analytics';
import { db, auth } from '../firebase';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faGear, faUserPlus, faAngleDown, faUserMinus, faCircleXmark, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

import logo from './img/Customer.png';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';

function ChatBox() {

  const [user] = useAuthState(auth);
  const resetRef = useRef();

  const [userID, setUSerID] = useState('');
  const [cusData, setData] = useState([]);
  const [customerChatID, setcustomerChatID] = useState('')
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [searchVendor, setSearchVendor] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [selectedVedor, setselectedVedor] = useState([]);

  const [customer_message_collections, set_customer_message_collections] = useState([]);
  const [vendorDetails, setVendorDetails] = useState([]);

  const [filteredCustomerChats, setFilteredCustomerChats] = useState([...customer_message_collections]);
  const [filteredVendorDetails, setFilteredVendorDetails] = useState([...vendorDetails]);

  const [showModal, setShowModal] = useState({
    addVendor: false,
    removeVendor: false,
    showInfo: false,
  });

  if (user.uid !== "XIidzTBzhaWAtUoRlTMUvvEnDlz1") {
    alert("sorry you are not authetincat admin")
    auth.signOut();
  }

  const addSelecetedVendor = (customerChatID) => {
    filteredCustomerChats.map((value, key) => {
      if (customerChatID === value.customer_collection_id) {
        if (value.supplier_id === '' || value.supplier_id === null || value.supplier_id === undefined) {
          alert('vendor added')
        } else {
          alert('vendor is already existing')
        }
      }
    })
  }

  const removeVendor = (customerChatID) => {
    alert(`vendor removed ${customerChatID}`)
  }
 
  const searchVendorFun = (e) => {
    const searchVendor = e.target.value.toLowerCase();
    setSearchVendor(searchVendor)
    if (searchVendor === '') {
      setFilteredVendorDetails([...vendorDetails]);
    } else {
      const filteredDetails = vendorDetails.filter(
        (vendor) => vendor.supplier_name.toLowerCase().startsWith(searchVendor)
      );
      setFilteredVendorDetails(filteredDetails);
    }
  };

  const searchCustomerFun = (e) => {
    const searchVendor = e.target.value.toLowerCase();
    setSearchCustomer(searchVendor)
    if (searchVendor === '') {
      setFilteredCustomerChats(customer_message_collections);
    } else {
      const filteredDetails = customer_message_collections.filter(
        (vendor) => vendor.customer_name.toLowerCase().startsWith(searchVendor)
      );
      setFilteredCustomerChats(filteredDetails);
    }
  };

  const getGroupchat = (para) => {
    if (para !== '') {
      const filteredDetails = customer_message_collections.filter(
        (vendor) => vendor.group_chat === (para === 'getGrpChat' ? 'true' : para === 'getPrivateChat' ? 'false' : '')
      );
      resetRef.current.style.display = 'block'
      setFilteredCustomerChats(filteredDetails);
    } else {
      setFilteredCustomerChats(customer_message_collections);
      resetRef.current.style.display = 'none'
    }
  };

  const getUserMessages = (value) => {
    setcustomerChatID(value);
    const q = query(
      collection(db, "chats/chats_dats/" + value),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const getMessages = onSnapshot(q, (QuerySnapshot) => {
      const fetchedMessages = [];
      QuerySnapshot.forEach((doc) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id });
      });
      const sortedMessages = fetchedMessages.sort(
        (a, b) => a.createdAt - b.createdAt
      );
      setMessages(sortedMessages);
      setUSerID(value)
    });
    return getMessages;
  }

  const sendMessage = async (event) => {
    event.preventDefault();
    if (userMessage.trim() === "") {
      return null;
    }
    // admin UI shoule be constant
    // need to develope
    const adminUID = 'XIidzTBzhaWAtUoRlTMUvvEnDlz1';
    const { displayName, photoURL } = auth.currentUser;
    await addDoc(collection(db, "chats/chats_dats/" + userID), {
      text: userMessage,
      name: displayName,
      avatar: photoURL,
      createdAt: serverTimestamp(),
      adminUID,
    });
    setUserMessage("");
  }

  const getTime = (value, type) => {
    if (value?.seconds !== undefined && value?.nanoseconds !== undefined) {
      const ts = (value.seconds + value.nanoseconds / 1000000000) * 1000;
      if (type === "value1") {
        return new Date(ts).toLocaleDateString();
      }
      if (type === "value2") {
        return new Date(ts).toDateString();
      }
    }
    return '';
  };

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  const signOut = () => {
    auth.signOut();
  };

  const fetchData = async () => {
    try {
      const data_promise = filteredCustomerChats.map(async (value) => {
        const q = query(
          collection(db, "chats/chats_dats/" + value.customer_collection_id),
          orderBy("createdAt", "asc"),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const fetchedMessages = [];
        querySnapshot.forEach((doc) => {
          fetchedMessages.push({ ...doc.data(), id: doc.id });
        });
        const sortedMessages = fetchedMessages.sort(
          (a, b) => a.createdAt - b.createdAt
        );
        return { customerChatID: value, sortedMessages };
      })
      const allData = await Promise.all(data_promise);
      setData(allData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [customer_message_collections, filteredCustomerChats]);

  useEffect(() => {
    // axios.get('/chats').then(res => {  
    //   if (res.data.status === 200) {
    //     set_customer_message_collections(res.data.data);
    //     setFilteredCustomerChats(res.data.data);
    //     console.log(res);
    //   }
    // })

    axios.get('https://api.aahaas.com/api/getvendors').then(res => {
      if (res.data.status === 200) {
        setVendorDetails(res.data.data);
        setFilteredVendorDetails(res.data.data);
        console.log(res);
      }
    })

  }, [])

  return (
    <div className="d-flex">
      <div className="col-4 user_chat_details">
        <div className="col-11 search_box d-flex align-items-center justify-content-start ">
          <img src={logo} className='admin_logo' />
          <input className="col-9 my-2 " value={searchCustomer} placeholder="Search user..." onChange={(e) => searchCustomerFun(e)} />
        </div>
        <div className='d-flex'>
          <button className='btn filter_buttons' onClick={() => { getGroupchat('getGrpChat') }}>Group chat</button>
          <button className='btn filter_buttons' onClick={() => { getGroupchat('getPrivateChat') }}>private chat</button>
          <button className='btn filter_buttons reset_buttons' ref={resetRef} style={{ display: 'none' }} onClick={() => { getGroupchat('') }}>
            <span className='mx-2'>reset</span>
            <FontAwesomeIcon icon={faCircleXmark} /></button>
        </div>
        <div className="customer_head">
          {
            cusData.map((value, key) => (
              value.sortedMessages.length >= 1 &&
              <div className="customer_details" key={key} onClick={() => getUserMessages(value.customerChatID.customer_collection_id)}>
                <img className="user_image" src={value.sortedMessages[0]?.avatar} alt='user profile' />
                <p className='user_name'>{value.customerChatID.customer_name}</p>
                <p className='last_time'>{value.customerChatID.updated_at.slice(11, 16)}</p>
                <p className='user_last_msg'>{value.sortedMessages[0]?.text}</p>
              </div>
            ))
          }
        </div>
      </div>
      {
        messages.length > 0 &&
        <div className="col-8">
          <div className="main_customer_head">
            <img className="user_image user_image_main" src={messages[0]?.avatar || logo} />
            <p className="user_name_main">{messages[0]?.name}</p>
            <p className="user_last_seen_main">last seen at {getTime(messages[messages.length - 1]?.createdAt, "value2")}</p>
            <FontAwesomeIcon icon={faUserPlus} className="add_vendor_icon" onClick={() => setShowModal(prevState => ({ ...prevState, addVendor: true }))} />
            <FontAwesomeIcon icon={faUserMinus} className="close_vendor_icon" onClick={() => setShowModal(prevState => ({ ...prevState, removeVendor: true }))} />
            <FontAwesomeIcon icon={faGear} className="settings_icon" onClick={() => setShowModal(prevState => ({ ...prevState, showInfo: true }))} />
            {
              user ?
                <button onClick={signOut} className="sign_out_button" type="button">Sign Out</button>
                :
                <button className="sign_in_button">
                  <img onClick={googleSignIn} src={googleSignIn} alt="sign in with google" type="button" />
                </button>
            }
          </div>
          <div className="chat_msg_update">
            {
              messages.map((value, key) => {
                return (
                  <div className={`${value.uid === undefined ? "chat_bubble_main right_side" : "chat_bubble_main left_side"} `} key={key}>
                    <p className="chat_context">{value.text} : <span>({value.name || value.uid})</span> </p>
                    <span className="chat_time">{getTime(value?.createdAt, "value2")}</span>
                  </div>
                )
              })
            }
            <span className="go_down_button">
              <FontAwesomeIcon icon={faAngleDown} />
            </span>
          </div>
          <div className="message_send_content d-flex">

            <input type="text" className="col-11" value={userMessage} placeholder={`chat with user...`} onChange={(e) => setUserMessage(e.target.value)} />
            <button className="col-1 send_icon_main">
              <FontAwesomeIcon icon={faPaperPlane} onClick={sendMessage} /></button>
          </div>
        </div>
      }

      <Modal show={showModal.addVendor} className="model_popup">
        <div className="container">
          <div className="">
            <input className="form-control mb-2 mt-4" placeholder="Search vendor name..."
              type="text"
              value={searchVendor}
              onChange={(e) => { searchVendorFun(e) }}
            />
            <p>select item : {selectedVedor.supplier_name}</p>
            <div className="search_main">
              {filteredVendorDetails.map((brand, index) => (
                <li className="search_results" key={index} onClick={() => setselectedVedor(brand)}>{brand.supplier_name}</li>
              ))}
            </div>
          </div>
          <div className='container mb-5 mt-4 d-flex justify-content-evenly'>
            <button className='btn btn-primary' onClick={() => addSelecetedVendor(customerChatID)} >Add</button>
            <button className='btn btn-danger ' onClick={() => setShowModal(prevState => ({ ...prevState, addVendor: false }))}>Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal show={showModal.removeVendor} className="model_popup">
        <div className="remove_pop_up container">
          <p className='text-center border-bottom py-5 fs-4'>Are you sure to remove the supllier.. ?</p>
          <div className='d-flex justify-content-around col-6 offset-3 my-3'>
            <button className='btn btn-primary px-3 mx-5 col-4' onClick={() => { removeVendor(customerChatID) }}>Yes</button>
            <button className='btn btn-danger px-3 mx-5 col-4' onClick={() => setShowModal(prevState => ({ ...prevState, removeVendor: false }))}>No</button>
          </div>
        </div>
      </Modal>

      <Modal show={showModal.showInfo} className="model_popup">
        <div className="remove_pop_up">
          <div className='heading border-bottom'>
            <p className='fs-5 mx-3'><FontAwesomeIcon icon={faCircleInfo} className='info_icon' /></p>
            <p className='fs-5'>Chat info</p>
          </div>
          <div className='border p-4'>
            <p>Chat created : </p>
            <p>Supplier added date : </p>
            <p>Supplier mail id : </p>
            <p>Supplier name : </p>
            <p>Customer mail id : </p>
            <p>Query status :
              <select className='border-0 p-1 outline-0'>
                <option value="select" selected>---</option>
                <option value="completed">completed</option>
                <option value="pending">pending</option>
                <option value="rejected">rejected</option>
              </select>
            </p>
            <p>
              Comments :
              <input className='border-0 border-bottom mx-2' placeholder='Your comments here...' />
            </p>

          </div>
          <div className='buttons d-flex justify-content-center m-4'>
            <button className='btn btn-primary mx-4'>Update</button>
            <button className='btn btn-secondary mx-4' onClick={() => { setShowModal(prevState => ({ ...prevState, showInfo: false })) }}>Cancel</button>
          </div>
        </div>
      </Modal>

    </div>
  )
}

export default ChatBox