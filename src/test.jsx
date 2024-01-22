const [vendor, setvendor] = useState('');
const [searchTerm, setSearchTerm] = useState('');
const [filteredBrandNames, setFilteredBrandNames] = useState(initialBrandNames);

const initialBrandNames = [
    'Nike',
    'Adidas',
    'Apple',
    'Samsung',
    'Google',
    'Microsoft',
    'Coca-Cola',
    'Toyota',
    'Amazon',
    'Facebook',
    'Tesla',
    'Sony',
    'Puma',
    'IBM',
    'HP',
    'Dell',
    'Intel',
    'AMD',
    'Nvidia',
    'Canon',
    'Sony',
    'Panasonic',
    'LG',
    'Bose',
    'Ferrari',
    'Lamborghini',
    'Mercedes-Benz',
    'BMW',
    'Audi',
    'Volkswagen',
    'Colgate',
    'Johnson & Johnson',
    'Nestle',
    'Pepsi',
    'McDonald\'s',
    'Burger King',
    'Subway',
    'Starbucks',
    'Coca-Cola',
    'Pepsi',
    // Add more brand names as needed
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = auth.currentUser;

        if (authUser) {
          // User is signed in.
          setUser(authUser);

          // Fetch user data from Firestore using UID.
          const userRef = firestore.collection('chats/chats_dats').doc('7XqULuARo2NWrO89DnV9IVGsZ2Q2');
          const doc = await userRef.get();

          if (doc.exists) {
            // Update state with user data.
            setUserName(doc.data().name);
            console.log(doc.data().name);
          } else {
            console.log('No such document!');
          }
        } else {
          // User is signed out.
          setUser(null);
          setUserName('');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, []);


  const handleSearch = (event) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);

    const filteredNames =
      searchValue.trim() === ''
        ? initialBrandNames
        : initialBrandNames.filter((brand) =>
          brand.toLowerCase().includes(searchValue.toLowerCase())
        );

    setFilteredBrandNames(filteredNames);
  };