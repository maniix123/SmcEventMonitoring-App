//------------------------------------- SWITCH CASE FOR LOGIN AND NETWORK INFORMATION ------------------------//
	function Login() 
	{
			switch(checkconnection())
			{
				case 'false': 
						alert('No internet connection detected.');
				break;
				
				case 'LoginProcess':
						LoginProcess();
			default:
			}
	}
//--------------------------------------END OF SWITCH CASE ----------------------------------------------//	

//--------------------------------------CHECK CONNECTION HERE -------------------------------------------//
	function checkconnection()
	{
		var networkState = navigator.connection.type;
		if(networkState == Connection.WIFI || networkState == Connection.CELL_4G || networkState == Connection.CELL_3G || networkState == Connection.CELL_2G)
		{
			return 'LoginProcess';
		}
		else
		{
			return 'false';
		}
	}
//------------------------------------------END OF CHECKING OF CONNECTION -------------------------------------//

//------------------------------------------ACTUAL LOGIN PROCESS ----------------------------------------------//	
	function LoginProcess()
	{
		var LoginUsername = document.getElementById('LoginUsername').value;
		var LoginPassword = document.getElementById('LoginPassword').value;
		if (LoginUsername == '' && LoginPassword == '')
		{
			alert('You need to enter your Username and Password!');
		}
		else
		{
			xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() 
			{
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
				{
					var Response = xmlhttp.responseText +"";
					if(Response == 1)
					{
						var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
						db.transaction(inputusername, errorCB);
						alert( 'Login Sucessful!!');
						window.location.href = 'HomePage.html';
					}
					else{alert(Response);}
				}
			}
			var params = "Username="+LoginUsername+ " &Password=" +LoginPassword;
			xmlhttp.open("POST","http://www.smceventmonitoring.eu.pn/User.php",true); 
			xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			xmlhttp.setRequestHeader("Content-length", params.length);
			xmlhttp.send(params);
		}
	}
	function inputusername(fa) {
		var Usernametwo = document.getElementById('LoginUsername').value;
		fa.executeSql('DROP TABLE IF EXISTS User');
        fa.executeSql('CREATE TABLE IF NOT EXISTS User (name TEXT)');
		fa.executeSql("INSERT INTO User (name) VALUES (?)",[Usernametwo]);
    }
	function errorCB(err) 
	{
		alert(err);
    }
//--------------------------------------------------- END  --------------------------------------//

//-------------------------------------------------- EVENTS ---------------------------------------------//
	$(document).on("pagebeforeshow","#events",function(){
		$('ul#events').append('<li>Loading....</li>').listview('refresh');
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
		{
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
			{
				$('ul#events').empty();
				$('ul#events').append(xmlhttp.responseText).hide().slideDown('slow').listview('refresh');
            }
        }
		xmlhttp.open("Get","http://www.smceventmonitoring.eu.pn/Events.php",true);
        xmlhttp.send();	
	});
//-------------------------------------------- END OF EVENTS -----------------------------------------------//

//------------------------------------------- ATTEND EVENTS -----------------------------------------------//
	function Attend(a){
	var r = confirm("Attend " +a.id + " ?");
		if (r == true)
		{
			Attend2(a.value);
		} 
	}
	function Attend2(a) {
		var ID = a;
		var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
		db.transaction(function(tx){
			CBfnc(tx,ID)
		}, error2);
	}
	function CBfnc(tx, ID) 
	{
		var id = ID;
		tx.executeSql('SELECT * FROM User', [],function(tx,results){
			Display(tx, results, id)
		}, error2);
	}
	function Display(tx, results, id) 
	{
		var IId = id; 
		var StudentID2 = results.rows.item(0).name;
		navigator.geolocation.getCurrentPosition(function(position)
	{
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		onSuccess(lat, lng, IId, StudentID2);
	},
	function(error) 
	{
		geolocFail(error);
	});
	}
	function onSuccess(lat2, lng2, IID, StudentID2) 
	{
		var ID = IID;
		var StudentID = StudentID2;
        var lat = parseFloat(lat2);
        var lng = parseFloat(lng2);
        var latlng = new google.maps.LatLng(lat, lng);
        var geocoder = geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'latLng': latlng }, function (results, status) 
		{
            if (status == google.maps.GeocoderStatus.OK) 
			{
                if (results[0]) 
				{
				var arrAddress = results[0].address_components;
				$.each(arrAddress, function (i, address_component) 
				{
				  if (address_component.types[0] == "route") 
				  {
					var street = address_component.long_name;
					Final(street, ID,StudentID);
					return false;
				  }
				})
				
				}
			}
		});
	}
	function Final(street, ID, StudentID)
	{
		xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() 
		{
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
			{
				var Response = xmlhttp.responseText;
				alert(Response);
			}
		}
		var params = "street="+street+ " &ID=" +ID+ " &StudentID="+StudentID;
		xmlhttp.open("POST","http://www.smceventmonitoring.eu.pn/Attend_Events.php",true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.setRequestHeader("Content-length", params.length);
		xmlhttp.send(params);
	}
	function onError(error)
	{
		alert('could not get location');
	}
	function error2(err) 
	{

	}
//------------------------------------------  END OF ATTEND EVENTS ---------------------------------------//

//------------------------------------------- ATTENDED EVENTS ---------------------------------------//
	$(document).on("pagebeforeshow","#attended_events",function(){
		var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
        db.transaction(attendedevents, errorCB); 
	});
	function attendedevents(tx) {
        tx.executeSql('SELECT * FROM User', [], attended_success, errorCB);
    }
	function attended_success(tx, results)
	{
		var Usernames = results.rows.item(0).name;
		xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() 
		{
			$('ul#attended').append('<li>Loading...</li').listview('refresh');
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
			{
				$('ul#attended').empty();
				$('ul#attended').html(xmlhttp.responseText).hide().fadeIn('slow').listview('refresh');
			}
		}
		var params = "User="+Usernames;
		xmlhttp.open("POST","http://www.smceventmonitoring.eu.pn/Attended_Events.php",true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.setRequestHeader("Content-length", params.length);
		xmlhttp.send(params);
	}
	function errorCB(err) 
	{
		alert('There is an error!: '+err.message+ '\nSecond Message:' +err);
    }